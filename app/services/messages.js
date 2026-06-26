import Service, {service} from '@ember/service';
import {tracked} from '@glimmer/tracking';
import {set} from '@ember/object';
import {TrackedArray, TrackedSet} from 'tracked-built-ins';

// The single, coerced "is this person the viewer/owner?" predicate. Mirrors the
// Number() handling in person-message's isMessageUnread — ember-data stores ids
// as strings while idNumber/userId are numbers.
export function isViewer(a, b) {
  return Number(a) === Number(b);
}

/**
 * Owns the Clubhouse message mailbox: loading, sending, mark-read, unread
 * accounting, and per-message open/closed view state.
 *
 * The <MessageInbox> family are thin view bindings over this service. The
 * session asks it to refresh (`session.loadMessages`), replacing the old
 * contract where the component reached into the session with a global callback
 * and smeared mailbox state across the component, model, and session.
 */
export default class MessagesService extends Service {
  @service ajax;
  @service errors;
  @service session;
  @service store;
  @service storePayload;
  @service toast;
  @service saveModel;

  @tracked messages = new TrackedArray([]);
  @tracked isLoading = false;
  @tracked isSending = false;
  @tracked isMarkingRead = false;

  // Open accordion rows, keyed by message id. View state lives here, not on the
  // persisted Ember Data model, so a reload no longer throws it away.
  expanded = new TrackedSet();

  // Single-flight load guard. A refresh requested mid-load re-runs once after.
  _loading = null;
  _reloadPending = false;

  isExpanded(id) {
    return this.expanded.has(`${id}`);
  }

  setExpanded(id, open) {
    const key = `${id}`;
    if (open) {
      this.expanded.add(key);
    } else {
      this.expanded.delete(key);
    }
  }

  /**
   * Load (or refresh) the mailbox for a person. Concurrent calls coalesce: the
   * second caller awaits the in-flight load and a single re-run fires after it.
   */
  async load(personId) {
    if (this._loading) {
      this._reloadPending = true;
      return this._loading;
    }
    this.isLoading = true;
    this._loading = this._load(personId);
    try {
      await this._loading;
    } catch (response) {
      this.errors.handleErrorResponse(response);
    } finally {
      this._loading = null;
      this.isLoading = false;
      if (this._reloadPending) {
        this._reloadPending = false;
        await this.load(personId);
      }
    }
  }

  async _load(personId) {
    // Push over existing records (no unloadAll — that blew away person-message
    // records held elsewhere and discarded view state). Rebuilding the array
    // means server-deleted messages simply stop being referenced.
    const {person_message: mailbox = []} = await this.ajax.request('messages', {data: {person_id: personId}});
    this.messages = new TrackedArray(mailbox.map((row) => {
      row.replies = new TrackedArray(
        (row.replies ?? []).map((reply) => this.storePayload.pushPayload('person-message', reply))
      );
      return this.storePayload.pushPayload('person-message', row);
    }));
  }

  // Single pass over the mailbox: unread top messages and unread replies.
  unreadCounts(personId) {
    let messages = 0, replies = 0;
    for (const message of this.messages) {
      if (message.isUnread(personId)) {
        messages += 1;
      }
      replies += message.unreadReplyCount(personId);
    }
    return {messages, replies};
  }

  unreadCount(personId) {
    const {messages, replies} = this.unreadCounts(personId);
    return messages + replies;
  }

  // The single writer of person.unread_message_count and session.unreadMessageCount.
  pushUnreadToOwner(person) {
    if (!person) {
      return;
    }
    const count = this.unreadCount(person.idNumber);
    set(person, 'unread_message_count', count);
    if (isViewer(this.session.userId, person.idNumber)) {
      this.session.unreadMessageCount = count;
    }
  }

  /**
   * Persist a new message or reply, then splice it into the live mailbox.
   * @returns {Promise<boolean>} true on success.
   */
  async send(model, isValid, {topMessage = null, record = null, isContact = false, person = null} = {}) {
    if (!isValid || this.isSending) {
      return false;
    }
    this.isSending = true;
    try {
      if (!(await this.saveModel.save({model, message: 'Message successfully sent'}))) {
        return false;
      }
      if (!isContact) {
        if (topMessage) {
          // A locally-composed top message has no replies array yet, so seed it.
          if (!topMessage.replies) {
            topMessage.replies = new TrackedArray([]);
          }
          topMessage.replies.push(record);
        } else {
          this.messages.unshift(record);
        }
        // Match the legacy behaviour: only refresh the owner's count when the
        // viewer is the recipient (admins sending on someone's behalf don't).
        if (isViewer(this.session.userId, person?.idNumber)) {
          this.pushUnreadToOwner(person);
        }
      }
      return true;
    } finally {
      this.isSending = false;
    }
  }

  /**
   * Optimistically toggle delivered/read, persist, and roll back on failure.
   * Guards against double-clicks.
   * @returns {Promise<boolean>} true on success.
   */
  async markRead(person, message) {
    if (this.isMarkingRead) {
      return false;
    }
    this.isMarkingRead = true;
    const previous = message.delivered;
    message.delivered = !message.delivered;
    try {
      await this.ajax.patch(`messages/${message.id}/markread`, {
        data: {person_id: person.idNumber, delivered: message.delivered}
      });
      this.toast.success(`Message has been marked as ${message.delivered ? 'read' : 'unread'}`);
      this.pushUnreadToOwner(person);
      return true;
    } catch (response) {
      message.delivered = previous; // roll back the optimistic flip
      this.errors.handleErrorResponse(response);
      return false;
    } finally {
      this.isMarkingRead = false;
    }
  }
}
