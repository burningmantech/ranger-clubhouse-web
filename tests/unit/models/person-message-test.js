import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import {
  SENDER_TYPE_PERSON,
  SENDER_TYPE_RBS,
  SENDER_TYPE_TEAM,
} from 'clubhouse/models/person-message';

module('Unit | Model | person message', function (hooks) {
  setupTest(hooks);

  // sender_person_id, creator_person_id, delivered, and replies are readOnly
  // attributes, so push the record into the store to populate them.
  const pushMessage = (owner, attrs) =>
    owner.lookup('service:store').push({
      data: {
        id: '1',
        type: 'person-message',
        attributes: attrs,
      },
    });

  test('isDictated is true when person sender differs from creator', function (assert) {
    const model = pushMessage(this.owner, {
      sender_type: SENDER_TYPE_PERSON,
      creator_person_id: 1,
      sender_person_id: 2,
    });
    assert.true(model.isDictated);
  });

  test('isDictated is false when person creator and sender are the same', function (assert) {
    const model = pushMessage(this.owner, {
      sender_type: SENDER_TYPE_PERSON,
      creator_person_id: 1,
      sender_person_id: 1,
    });
    assert.false(model.isDictated);
  });

  test('isDictated is false for a non-person sender even when ids differ', function (assert) {
    const model = pushMessage(this.owner, {
      sender_type: SENDER_TYPE_TEAM,
      creator_person_id: 1,
      sender_person_id: 2,
    });
    assert.false(model.isDictated, 'the sender_type guard short-circuits isDictated');
  });

  test('sender type predicates', function (assert) {
    const rbs = pushMessage(this.owner, { sender_type: SENDER_TYPE_RBS });
    assert.true(rbs.isSenderRBS);
    assert.false(rbs.isSenderPerson);
    assert.false(rbs.isSenderOther);
  });

  test('fromName returns the broadcast system label for RBS senders', function (assert) {
    const model = pushMessage(this.owner, {
      sender_type: SENDER_TYPE_RBS,
      message_from: 'should be ignored',
    });
    assert.strictEqual(model.fromName, 'Ranger Broadcast System');
  });

  test('fromName prefers the sender person callsign', function (assert) {
    const model = pushMessage(this.owner, {
      sender_type: SENDER_TYPE_PERSON,
      sender_person: { callsign: 'Hubcap' },
      message_from: 'should be ignored',
    });
    assert.strictEqual(model.fromName, 'Hubcap');
  });

  test('fromName falls back to the sender team callsign', function (assert) {
    const model = pushMessage(this.owner, {
      sender_type: SENDER_TYPE_TEAM,
      sender_team: { callsign: 'Green Dot' },
      message_from: 'should be ignored',
    });
    assert.strictEqual(model.fromName, 'Green Dot');
  });

  test('fromName falls back to message_from when nothing else is set', function (assert) {
    const model = pushMessage(this.owner, {
      sender_type: SENDER_TYPE_PERSON,
      message_from: 'Lamplighter',
    });
    assert.strictEqual(model.fromName, 'Lamplighter');
  });

  test('unreadReplyCount counts only undelivered replies to the person from others', function (assert) {
    const model = pushMessage(this.owner, {
      replies: [
        { person_id: 10, sender_person_id: 20, delivered: false }, // counts
        { person_id: 10, sender_person_id: 30, delivered: false }, // counts
        { person_id: 10, sender_person_id: 40, delivered: true }, // delivered, skip
        { person_id: 10, sender_person_id: 10, delivered: false }, // self-sent, skip
        { person_id: 99, sender_person_id: 20, delivered: false }, // other person, skip
      ],
    });
    assert.strictEqual(model.unreadReplyCount(10), 2);
  });

  test('unreadReplyCount is zero when there are no replies', function (assert) {
    const model = pushMessage(this.owner, { subject: 'Hi' });
    assert.strictEqual(model.unreadReplyCount(10), 0);
  });

  test('isTopMessage reflects whether reply_to_id is set', function (assert) {
    const top = pushMessage(this.owner, { subject: 'Hi' });
    assert.true(top.isTopMessage);
  });
});
