import Service, {service} from '@ember/service';
import {isChangeset} from 'validated-changeset';

/**
 * The record-save seam: the one place an Ember Data record OR an
 * ember-changeset is persisted. Owns the save → toast → error → rollback
 * choreography so callers stop re-typing it.
 *
 * For the command-POST counterpart — a server action that returns a status
 * rather than a saved record — see the `command` service.
 */
export default class SaveModelService extends Service {
  @service errors;
  @service toast;

  /**
   * Persist a record or changeset.
   *
   * @param {object} options
   * @param {Model|Changeset} options.model the record or changeset to save
   * @param {string} [options.message] success toast; shown only on success
   * @param {object} [options.owner] optional double-submit guard — a
   *   controller/component exposing a tracked `isSubmitting`. Omit it when the
   *   caller owns its own guard (e.g. a differently-named pending flag).
   * @returns {Promise<boolean>} true on success; false on failure OR if a
   *   guarded save is already in flight.
   */
  async save({model, message, owner}) {
    if (owner?.isSubmitting) {
      return false;
    }

    if (owner) {
      owner.isSubmitting = true;
    }
    this.toast.clear();
    try {
      await model.save();
      if (message) {
        this.toast.success(message);
      }
      return true;
    } catch (response) {
      // A changeset carries the server's field errors back to the form; a bare
      // record has no changeset to populate, so pass null.
      this.errors.handleErrorResponse(response, isChangeset(model) ? model : null);
      // Changesets are throwaway clones (ch-form rebuilds them on the next
      // render); only a bare record needs its failed edit rolled back.
      if (!isChangeset(model)) {
        model.rollbackAttributes();
      }
      return false;
    } finally {
      if (owner) {
        owner.isSubmitting = false;
      }
    }
  }
}
