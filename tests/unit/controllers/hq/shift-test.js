import {module, test} from 'qunit';
import {setupTest} from 'ember-qunit';
import {
  HQ_TODO_ISSUE_RADIO,
  HQ_TODO_START_SHIFT,
  HQ_TODO_VERIFY_TIMESHEET,
} from 'clubhouse/constants/hq-todo';
import ModalSiteLeaveComponent from 'clubhouse/components/modal-site-leave';

// The bare minimum the controller reads while building the todo list.
function setupPerson(controller, {timesheetsToReview = [], assetAuthorized = true} = {}) {
  controller.person = {id: '1', callsign: 'Hardware', unread_message_count: 0};
  controller.personEvent = {asset_authorized: assetAuthorized};
  controller.eventInfo = {radio_max: 0, event_period: 'event'};
  controller.eventPeriods = {pre: {}, event: {}, post: {}};
  controller.timesheets = [];
  controller.timesheetsToReview = timesheetsToReview;
  controller.assets = [];
}

const todoTasks = (controller) => controller.todos.map((t) => t.task);
const upcoming = {upcomingSlots: {imminent: [{}], upcoming: []}};

module('Unit | Controller | hq/shift', function (hooks) {
  setupTest(hooks);

  test('resetState clears the dialog & guard state left by the previous person', function (assert) {
    const controller = this.owner.lookup('controller:hq/shift');

    controller.showNoShiftHandled = true;
    controller.showUnsubmittedBarcodeDialog = true;
    controller.unsubmittedBarcode = '1234';
    controller.shiftTransition = {retry: () => {}};
    controller.isMarkingOffSite = true;
    controller.endedShiftEntry = {id: '7'};

    controller.resetState();

    assert.false(controller.showNoShiftHandled, 'the no-shift dialog is closed');
    assert.false(controller.showUnsubmittedBarcodeDialog, 'the barcode dialog is closed');
    assert.strictEqual(controller.unsubmittedBarcode, '', 'the barcode guard is cleared');
    assert.strictEqual(controller.shiftTransition, null, 'the stale transition is dropped');
    assert.false(controller.isMarkingOffSite, 'the off site spinner is cleared');
    assert.strictEqual(controller.endedShiftEntry, null, 'the ended shift is cleared');
  });

  test('initializeTodos suggests a radio checkout only when the radio agreement is signed', function (assert) {
    const controller = this.owner.lookup('controller:hq/shift');

    setupPerson(controller);
    controller.initializeTodos(upcoming);
    assert.deepEqual(todoTasks(controller), [HQ_TODO_START_SHIFT, HQ_TODO_ISSUE_RADIO]);

    setupPerson(controller, {assetAuthorized: false});
    controller.initializeTodos(upcoming);
    assert.deepEqual(todoTasks(controller), [HQ_TODO_START_SHIFT],
      'no un-completable Checkout Radio task when radios may not be issued');
  });

  test('initializeTodos ignores timesheet entries whose review was skipped', function (assert) {
    const controller = this.owner.lookup('controller:hq/shift');

    setupPerson(controller, {timesheetsToReview: [{isUnverified: true, isIgnoring: false}]});
    controller.initializeTodos(upcoming);
    assert.true(todoTasks(controller).includes(HQ_TODO_VERIFY_TIMESHEET), 'an unreviewed entry is nagged about');

    setupPerson(controller, {timesheetsToReview: [{isUnverified: true, isIgnoring: true}]});
    controller.initializeTodos(upcoming);
    assert.false(todoTasks(controller).includes(HQ_TODO_VERIFY_TIMESHEET),
      'a skipped entry does not re-open the review task');
  });

  test('markOffSite warns about the outstanding tasks before confirming', function (assert) {
    const controller = this.owner.lookup('controller:hq/shift');
    const opened = [];

    controller.modal.open = (component, data) => opened.push({component, data});
    controller.modal.confirm = () => opened.push({component: null, data: null});

    setupPerson(controller, {timesheetsToReview: [{isUnverified: true, isIgnoring: false}]});
    controller.initializeTodos(upcoming);
    controller.markOffSite();

    assert.strictEqual(opened[0].component, ModalSiteLeaveComponent, 'the outstanding item dialog is shown');
    assert.deepEqual(opened[0].data, [
      '1 timesheet entry not reviewed.',
      'Suggested task not done: Start A Shift',
      'Suggested task not done: Checkout Radio',
    ], 'every pending item and undone suggested task is listed');

    // Nothing left outstanding -> plain confirmation, no warning.
    setupPerson(controller);
    controller.todos = [];
    controller.askIfDone = null;
    controller.markOffSite();

    assert.strictEqual(opened[1].component, null, 'a cleared person just gets the plain confirmation');
  });
});
