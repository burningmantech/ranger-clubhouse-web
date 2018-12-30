import markSlotsOverlap from 'clubhouse/utils/mark-slots-overlap';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Utility | mark-slots-overlap', function(hooks) {
  setupTest(hooks);

  test('it works', function(assert) {
    const store = this.owner.lookup('service:store');
    const slot1 = run(() => store.createRecord('schedule', {
      slot_begins_time: 100095,
      slot_ends_time: 102015,
      position_id: 2,
      slot_description: 'Afternoon',
    }));
    const slot2 = run(() => store.createRecord('schedule', {
      slot_begins_time: 101095,
      slot_ends_time: 103015,
      position_id: 2,
      slot_description: 'Swing',
    }));
    const slot3 = run(() => store.createRecord('schedule', {
      slot_begins_time: 105095,
      slot_ends_time: 107015,
      position_id: 2,
      slot_description: 'Afternoon',
    }));
    markSlotsOverlap([slot1, slot2, slot3]);
    assert.ok(slot1.get('is_overlapping'));
    assert.ok(slot2.get('is_overlapping'));
    assert.notOk(slot3.get('is_overlapping'));
  });
});
