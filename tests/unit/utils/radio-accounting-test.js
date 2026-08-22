import {module, test} from 'qunit';
import {computeRadioTodo, radioAccounting} from 'clubhouse/utils/radio-accounting';
import {
  HQ_TODO_COLLECT_RADIO,
  HQ_TODO_COLLECT_RADIO_IF_DONE,
  HQ_TODO_ISSUE_RADIO,
} from 'clubhouse/constants/hq-todo';
import {TYPE_GEAR, TYPE_RADIO} from 'clubhouse/models/asset';

// An asset-person row as store.query('asset-person') hands it over: the asset
// is embedded, and perm_assign marks an event radio (vs. a shift radio).
function row(type, perm_assign = false) {
  return {asset: {type, perm_assign}};
}

const shiftRadio = () => row(TYPE_RADIO, false);
const eventRadio = () => row(TYPE_RADIO, true);

module('Unit | Utility | radio-accounting', function () {
  module('radioAccounting', function () {
    test('counts nothing when nothing is checked out', function (assert) {
      assert.deepEqual(radioAccounting([], 1), {
        shiftRadios: 0, eventRadios: 0, collectCount: 0, collectAtShiftEnd: 0, overMax: 0, radioMax: 1,
      });
    });

    test('ignores assets which are not radios', function (assert) {
      const {shiftRadios, eventRadios, collectCount} = radioAccounting([row(TYPE_GEAR)], 1);

      assert.strictEqual(shiftRadios, 0, 'gear is not a shift radio');
      assert.strictEqual(eventRadios, 0, 'gear is not an event radio');
      assert.strictEqual(collectCount, 0, 'gear is not collected as a radio');
    });

    test('splits shift and event radios, and collects the shift radio', function (assert) {
      const accounting = radioAccounting([shiftRadio(), eventRadio()], 1);

      assert.strictEqual(accounting.shiftRadios, 1);
      assert.strictEqual(accounting.eventRadios, 1);
      assert.strictEqual(accounting.collectAtShiftEnd, 0, 'the event radio is within the limit');
      assert.strictEqual(accounting.collectCount, 1, 'only the shift radio is collected');
      assert.strictEqual(accounting.overMax, 1, 'one event radio is kept for the event');
    });

    test('collects the event radios above the limit at the end of the shift', function (assert) {
      const accounting = radioAccounting([eventRadio(), eventRadio()], 1);

      assert.strictEqual(accounting.eventRadios, 2);
      assert.strictEqual(accounting.collectAtShiftEnd, 1, 'one radio is over the limit');
      assert.strictEqual(accounting.collectCount, 1);
      assert.strictEqual(accounting.overMax, 1, 'the limit is what may be kept');
    });
  });

  module('computeRadioTodo', function () {
    const todoFor = (options) => computeRadioTodo({
      isOffDuty: false,
      noMoreScheduled: false,
      assetAuthorized: true,
      ...options,
    });

    test('on duty: collect the radios which are due back', function (assert) {
      assert.strictEqual(
        todoFor({accounting: radioAccounting([shiftRadio()], 1)}),
        HQ_TODO_COLLECT_RADIO
      );
    });

    test('on duty with no more shifts: ask if the event radio is still needed', function (assert) {
      assert.strictEqual(
        todoFor({noMoreScheduled: true, accounting: radioAccounting([eventRadio()], 1)}),
        HQ_TODO_COLLECT_RADIO_IF_DONE
      );
    });

    test('on duty with more shifts scheduled: leave the event radio alone', function (assert) {
      assert.strictEqual(todoFor({accounting: radioAccounting([eventRadio()], 1)}), null);
    });

    test('off duty with no radio: issue one', function (assert) {
      assert.strictEqual(
        todoFor({isOffDuty: true, accounting: radioAccounting([], 0)}),
        HQ_TODO_ISSUE_RADIO,
        'not event radio eligible'
      );
      assert.strictEqual(
        todoFor({isOffDuty: true, accounting: radioAccounting([], 1)}),
        HQ_TODO_ISSUE_RADIO,
        'below the event radio limit'
      );
    });

    test('off duty without a signed radio agreement: do not suggest issuing a radio', function (assert) {
      assert.strictEqual(
        todoFor({isOffDuty: true, assetAuthorized: false, accounting: radioAccounting([], 0)}),
        null,
        'not event radio eligible'
      );
      assert.strictEqual(
        todoFor({isOffDuty: true, assetAuthorized: false, accounting: radioAccounting([], 1)}),
        null,
        'below the event radio limit'
      );
      assert.strictEqual(
        todoFor({isOffDuty: true, assetAuthorized: false, accounting: radioAccounting([shiftRadio()], 0)}),
        HQ_TODO_COLLECT_RADIO,
        'radios already out are still collected'
      );
    });

    test('off duty over the event radio limit: collect the extras', function (assert) {
      assert.strictEqual(
        todoFor({isOffDuty: true, accounting: radioAccounting([eventRadio(), eventRadio()], 1)}),
        HQ_TODO_COLLECT_RADIO
      );
    });

    test('off duty, at the limit, with no more shifts: ask if they are done', function (assert) {
      assert.strictEqual(
        todoFor({isOffDuty: true, noMoreScheduled: true, accounting: radioAccounting([eventRadio()], 1)}),
        HQ_TODO_COLLECT_RADIO_IF_DONE
      );
    });

    test('off duty, at the limit, still working: nothing to nag about', function (assert) {
      assert.strictEqual(
        todoFor({isOffDuty: true, accounting: radioAccounting([eventRadio()], 1)}),
        null
      );
    });
  });
});
