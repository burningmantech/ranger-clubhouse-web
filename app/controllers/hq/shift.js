import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {validatePresence} from 'ember-changeset-validations/validators';
import {ALPHA, BURN_PERIMETER} from 'clubhouse/constants/positions';
import {tracked} from '@glimmer/tracking';
import {
  HQ_TODO_COLLECT_RADIO, HQ_TODO_COLLECT_RADIO_IF_DONE, HQ_TODO_DELIVERY_MESSAGE,
  HQ_TODO_END_SHIFT, HQ_TODO_ISSUE_RADIO, HQ_TODO_MEAL_POG, HQ_TODO_MEAL_POG_NONE, HQ_TODO_NO_RADIO, HQ_TODO_OFF_SITE,
  HQ_TODO_START_SHIFT,
  HQ_TODO_VERIFY_TIMESHEET,
  HqTodoTask
} from "clubhouse/constants/hq-todo";
import {TYPE_RADIO} from "clubhouse/models/asset";
import {schedule} from '@ember/runloop';
import {radioAccounting, computeRadioTodo} from 'clubhouse/utils/radio-accounting';

export default class HqShiftController extends ClubhouseController {
  @tracked isMarkingOffSite = false;

  @tracked timesheets;
  @tracked timesheetsToReview;
  @tracked onDutyEntry;

  @tracked assets;
  @tracked eventInfo;

  @tracked todos = [];

  @tracked endedShiftEntry = null;

  @tracked askIfDone;

  @tracked showUnsubmittedBarcodeDialog = false;
  @tracked unsubmittedBarcode = '';

  @tracked showIsAlpha = false;

  @tracked showNoShiftHandled = false;

  // Imperative flags read only in JS (never in a template), so plain fields.
  noShiftHandled = false;
  shiftTransition = null;

  // Callback registered by the timesheet-correction child component; may be unset.
  correctionCallback = null;

  correctionValidations = {
    additional_notes: [validatePresence(true)]
  };

  /**
   * Figure out if the person is a Shiny Penny - i.e. their status is active, and
   * an Alpha shift was worked/walked.
   *
   * @returns {boolean}
   */

  get isShinyPenny() {
    return !!(this.timesheets.find((t) => t.position_id === ALPHA) && this.person.isActive);
  }

  /**
   * Are there any unverified and not being ignored timesheet entries?
   * (used to determine if Start Shift can be shown)
   *
   * @returns {boolean}
   */

  get hasUnreviewedTimesheet() {
    return !!this.timesheetsToReview.find((t) => (!t.isIgnoring && t.isUnverified));
  }

  /**
   * Count how many timesheet entries are left unverified.
   *
   * @returns {number}
   */

  get unreviewedTimesheetCount() {
    return this.timesheetsToReview.filter((t) => (!t.isIgnoring && t.isUnverified)).length;
  }

  /**
   * Find all checked out assets
   * @returns {[]}
   */

  get assetsCheckedOut() {
    return this.assets.filter((a) => !a.checked_in);
  }

  /**
   * Called when an asset has been checked out.
   *
   * @param asset
   */

  @action
  onAssetCheckOut(asset) {
    if (asset.type === TYPE_RADIO) {
      this.completeTodo(HQ_TODO_ISSUE_RADIO);
    }
    this.unsubmittedBarcode = '';
  }

  /**
   * Called when an asset has been checked in.
   */

  @action
  onAssetCheckIn() {
    if (!this.collectRadioCount) {
      this.completeTodo(HQ_TODO_COLLECT_RADIO);
      this.completeTodo(HQ_TODO_COLLECT_RADIO_IF_DONE);
    }
  }

  /**
   * Radio checkout/collection accounting derived from the checked-out assets and
   * the event radio_max limit. Single source for the radio-related getters below.
   *
   * @returns {{shiftRadios: number, eventRadios: number, collectCount: number,
   *   collectAtShiftEnd: number, overMax: number}}
   */

  get radioAccounting() {
    return radioAccounting(this.assetsCheckedOut, this.eventInfo.radio_max);
  }

  /**
   * How many radios are currently checked out?
   *
   * @returns {number}
   */

  get radioCount() {
    return this.assetsCheckedOut.filter((a) => a.asset.type === TYPE_RADIO).length;
  }

  /**
   * How many radios are to be collected?
   *
   * @return {number}
   */

  get collectRadioCount() {
    return this.radioAccounting.collectCount;
  }

  get collectEventRadiosAtShiftEnd() {
    return this.radioAccounting.collectAtShiftEnd;
  }

  /**
   * How many event radios to collect at the end of the event?
   *
   * @return {number}
   */

  get collectEventRadios() {
    return this.radioAccounting.overMax;
  }

  /**
   * How many shift radios are checked out?
   * (only used for people who are not event radio eligible)
   *
   * @returns {number}
   */

  get shiftRadios() {
    return this.radioAccounting.shiftRadios;
  }

  /**
   * How many event radios are checked out?
   *
   * @returns {number}
   */

  get eventRadios() {
    return this.radioAccounting.eventRadios;
  }

  /**
   * Check to see if the person may not need a radio for the shift.
   * (i.e. working a Burn Perimeter shift)
   *
   * @returns {boolean}
   */

  get mayNotNeedRadio() {
    return (this.onDutyEntry?.position_id === BURN_PERIMETER);
  }

  /**
   * Is person off duty
   *
   * @returns {boolean}
   */

  get isOffDuty() {
    return !this.timesheets.find((t) => t.stillOnDuty);
  }

  /**
   * Called when a shift was started.
   */

  @action
  async startShiftNotify() {

    try {
      this.noShiftHandled = false;
      await this.timesheets.update();
      this.completeTodo(HQ_TODO_START_SHIFT);
      this._findOnDuty();
      if (this.askIfDone) {
        this.askIfDone.ignore = true;
      }
      if (this.onDutyEntry?.position_id === BURN_PERIMETER) {
        this.removeTodo(HQ_TODO_ISSUE_RADIO);
        this.addTodo(HQ_TODO_NO_RADIO, true);
      } else {
        this._scrollToAssets();
      }
    } catch (response) {
      this.house.handleErrorResponse(response);
    }
  }

  _scrollToAssets() {
    this.house.scrollToAccordion('assets');
    schedule('afterRender', () => document.querySelector('#checkout-barcode')?.focus());
  }

  /**
   * Called when the worker has ended a shift.
   * - Update the unverified timesheet list.
   * - Tell top level hq route to update the schedule summaries for the sidebar.
   */

  @action
  async endShiftNotify(timesheet, submitCorrection) {
    try {
      this.noShiftHandled = false;
      await this.timesheets.update();
      this._reconcileTimesheetsToReview();
      this._findOnDuty()
      if (timesheet) {
        this.completeTodo(HQ_TODO_END_SHIFT);
        this.addTodo(HQ_TODO_VERIFY_TIMESHEET);
        const {eventPeriods, eventInfo: {event_period}} = this;
        if (eventPeriods[event_period].hasPass) {
          this.addTodo(HQ_TODO_MEAL_POG_NONE, true);
        } else {
          this.addTodo(HQ_TODO_MEAL_POG);
        }
        if (timesheet.position_id !== BURN_PERIMETER && !this.radioCount) {
          this.modal.info('No Radios Checked Out?',
            `It appears no radios were checked out for the shift. Please ask if they have a radio to return. If they have an authorized Event Radio, record it.`);
        }
      } else {
        this.removeTodo(HQ_TODO_END_SHIFT);
      }
      this.send('updateTimesheetSummaries');
      this.endedShiftEntry = timesheet;
      if (submitCorrection) {
        this.correctionCallback?.(timesheet);
      }
    } catch (response) {
      this.house.handleErrorResponse(response);
    }
  }

  /**
   * Re-derive the list of timesheets needing review after a shift update,
   * preserving entries that were already under review and re-applying any
   * "ignoring" flags that were set on them.
   *
   * @private
   */

  _reconcileTimesheetsToReview() {
    const ignored = {}, previousReview = {};
    this.timesheetsToReview.forEach((t) => {
      previousReview[t.id] = true;
      if (t.isIgnoring) {
        ignored[t.id] = true;
      }
    });
    this.timesheetsToReview = this.timesheets.filter((t) => previousReview[t.id] || t.isUnverified);
    this.timesheetsToReview.forEach((t) => {
      if (ignored[t.id]) {
        t.isIgnoring = true;
      }
    });
  }

  @action
  registerCorrectionAction(correctionCallback) {
    this.correctionCallback = correctionCallback;
  }

  /**
   * Mark a person on or off site.
   *
   * @param {boolean} isOnSite
   * @private
   */

  async _updateOnSite(isOnSite) {
    this.isMarkingOffSite = true;
    this.person.on_site = isOnSite;
    try {
      await this.person.save();
      this.toast.success(`${this.person.callsign} has been successfully marked ${isOnSite ? 'ON' : 'OFF'} SITE.`);
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isMarkingOffSite = false
    }
  }

  /**
   * Attempt to mark a person off site. Pop up a dialog if items are outstanding (checked out radios, unverified
   * shifts, etc.)
   */

  @action
  markOffSite() {
    // No outstanding items -- confirm just to be sure.
    this.modal.confirm('Confirm Marking Person Off Site',
      `Are you sure you wish to mark ${this.person.callsign} as OFF SITE?`,
      () => this._updateOnSite(false)
    );
  }

  @action
  onPogIssue() {
    this.completeTodo(HQ_TODO_MEAL_POG);
  }

  /**
   * Count how many of the following items the person has to deal with:
   * - Unverified timesheet entries
   * - Checked out assets
   * - Still on duty
   *
   * @returns {number}
   */

  get pendingItems() {
    let items = 0;

    if (!this.isOffDuty) {
      items++;
    }

    if (this.unreviewedTimesheetCount) {
      items++;
    }

    if (this.assetsCheckedOut.length) {
      items++;
    }

    return items;
  }

  /**
   * Find the on duty entry
   *
   * @private
   */

  _findOnDuty() {
    this.onDutyEntry = this.timesheets.find((t) => t.stillOnDuty);
  }

  /**
   * Mark a todo item as completed.
   *
   * @param {string} task
   * @private
   */

  @action
  completeTodo(task) {
    let todo;
    if (task === HQ_TODO_OFF_SITE) {
      todo = this.askIfDone;
    } else {
      todo = this.todos.find((t) => t.task === task);
    }
    if (todo) {
      todo.completed = true;
    }
  }

  /**
   * Add a todo list item
   *
   * @param {string} task
   * @param {boolean} ignore
   */

  addTodo(task, ignore = false) {
    const existing = this.todos.find((t) => t.task === task);

    if (existing) {
      existing.completed = false;
      existing.ignore = ignore;
    } else {
      this.todos = [...this.todos, new HqTodoTask(task, ignore)];
    }
  }

  /**
   * Build the initial suggested-task (todo) list for the person, based on their
   * messages, unverified timesheets, on/off duty state, upcoming shifts, and
   * radio accounting. Called once by the route after the model is wired up.
   *
   * @param {object} model the route model (provides `upcomingSlots`)
   */

  initializeTodos(model) {
    this.todos = [];

    if (this.person.unread_message_count) {
      this.setupTodo(HQ_TODO_DELIVERY_MESSAGE);
    }

    if (this.timesheetsToReview.length) {
      this.setupTodo(HQ_TODO_VERIFY_TIMESHEET);
    }

    const {upcomingSlots} = model;

    let noMoreScheduled = false;
    if (!upcomingSlots.imminent.length && !upcomingSlots.upcoming.length) {
      this.askIfDone = new HqTodoTask(HQ_TODO_OFF_SITE, false, true);
      noMoreScheduled = true;
    } else {
      this.askIfDone = null;
    }

    const {isOffDuty} = this;
    this.setupTodo(isOffDuty ? HQ_TODO_START_SHIFT : HQ_TODO_END_SHIFT);

    const radioTask = computeRadioTodo({
      isOffDuty,
      noMoreScheduled,
      accounting: this.radioAccounting,
    });

    if (radioTask) {
      this.setupTodo(radioTask);
    }
  }

  /**
   * Used by the route to build up the todo list.
   *
   * @param task
   */

  setupTodo(task) {
    this.todos = [...this.todos, new HqTodoTask(task, false)];
  }

  /**
   * Remove a todo list item
   */

  removeTodo(task) {
    this.todos = this.todos.filter((t) => t.task !== task);
  }

  /**
   * How many not completed todos are there?
   *
   * @returns {number}
   */

  get todoCount() {
    let count = this.todos.filter((t) => !t.completed && !t.ignore).length;
    if (this.askIfDone && !this.askIfDone.completed && !this.askIfDone.ignore) {
      count++;
    }

    return count;
  }

  @action
  afterShiftReview() {
    if (this.endedShiftEntry) {
      this.house.scrollToAccordion('assets', 'todo-list');
      this.house.openAccordion('pogs');
    }
  }

  @action
  updateBarcode(name, value) {
    this.unsubmittedBarcode = value?.trim();
  }

  @action
  closeUnsubmittedBarcodeDialog() {
    this.showUnsubmittedBarcodeDialog = false;
    this._scrollToAssets();
  }

  /**
   * Should the Meals and Showers section be highlighted?
   *
   * @returns {null|boolean}
   */

  get highlightMealShowers() {
    const {eventPeriods, eventInfo: {event_period}} = this;
    return (this.endedShiftEntry && !eventPeriods[event_period].hasPass);
  }

  @action
  closeIsAlphaDialog() {
    this.showIsAlpha = false;
  }

  @action
  closeNoShiftHandled() {
    this.showNoShiftHandled = false;
  }

  @action
  navigateAway() {
    this.showNoShiftHandled = false;
    this.noShiftHandled = false;
    this.shiftTransition.retry();
  }
}
