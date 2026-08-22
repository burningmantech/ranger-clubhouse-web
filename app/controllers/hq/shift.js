import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {ALPHA, BURN_PERIMETER, SELF_SERVE_POG_POSITIONS} from 'clubhouse/constants/positions';
import {tracked} from '@glimmer/tracking';
import {
  HQ_TODO_COLLECT_RADIO, HQ_TODO_COLLECT_RADIO_IF_DONE, HQ_TODO_DELIVERY_MESSAGE,
  HQ_TODO_END_SHIFT, HQ_TODO_ISSUE_RADIO, HQ_TODO_MEAL_POG, HQ_TODO_MEAL_POG_NONE, HQ_TODO_MEAL_POG_SELF_SERVE,
  HQ_TODO_NO_RADIO, HQ_TODO_OFF_SITE,
  HQ_TODO_START_SHIFT,
  HQ_TODO_VERIFY_TIMESHEET,
  HqTodoTask
} from "clubhouse/constants/hq-todo";
import {TYPE_RADIO} from "clubhouse/models/asset";
import ModalSiteLeaveComponent from 'clubhouse/components/modal-site-leave';
import {pluralize} from 'ember-inflector';
import {schedule} from '@ember/runloop';
import {radioAccounting, computeRadioTodo} from 'clubhouse/utils/radio-accounting';

/**
 * Escape a user-controlled string before interpolating it into a message
 * that will be rendered with htmlSafe (e.g. modal/toast messages).
 *
 * @param {string} str
 * @returns {string}
 */

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/**
 * Is a timesheet entry unreviewed, i.e. unverified and not being ignored?
 * Shared predicate so hasUnreviewedTimesheet/unreviewedTimesheetCount here and
 * in hq-timesheet-verification.js can't drift apart.
 *
 * @param {TimesheetModel} t
 * @returns {boolean}
 */

export function isUnreviewedTimesheet(t) {
  return !t.isIgnoring && t.isUnverified;
}

// Suggested tasks the pending item list already spells out in its own words.
const PendingItemTasks = [
  HQ_TODO_END_SHIFT,
  HQ_TODO_VERIFY_TIMESHEET,
  HQ_TODO_COLLECT_RADIO,
  HQ_TODO_COLLECT_RADIO_IF_DONE,
];

export default class HqShiftController extends ClubhouseController {
  @tracked person;
  
  @tracked isMarkingOffSite = false;

  @tracked timesheets;
  @tracked timesheetsToReview;

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

  /**
   * Per-entry reset of everything that must not leak from the previously viewed
   * person. Called by the route's setupController so the field names live once,
   * next to their declarations above.
   */

  resetState() {
    this.endedShiftEntry = null;
    this.unsubmittedBarcode = '';
    this.showUnsubmittedBarcodeDialog = false;
    this.showNoShiftHandled = false;
    this.shiftTransition = null;
    this.isMarkingOffSite = false;
  }

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
    return !!this.timesheetsToReview.find(isUnreviewedTimesheet);
  }

  /**
   * Count how many timesheet entries are left unverified.
   *
   * @returns {number}
   */

  get unreviewedTimesheetCount() {
    return this.timesheetsToReview.filter(isUnreviewedTimesheet).length;
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
   *
   * @param asset
   */

  @action
  onAssetCheckIn(asset) {
    if (asset.type === TYPE_RADIO && !this.collectRadioCount) {
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
   * The entry the person is currently signed into, if any. Derived live from
   * the timesheets so it cannot drift from isOffDuty when an entry is signed
   * off (by this window or another) without a re-query.
   *
   * @returns {TimesheetModel|undefined}
   */

  get onDutyEntry() {
    return this.timesheets.find((t) => t.stillOnDuty);
  }

  /**
   * Is person off duty
   *
   * @returns {boolean}
   */

  get isOffDuty() {
    return !this.onDutyEntry;
  }

  /**
   * Called when a shift was started.
   */

  @action
  async startShiftNotify() {

    try {
      this.noShiftHandled = false;
      const {timesheets} = this;
      const personId = this.person?.id;
      await timesheets.update();
      if (this._personChanged(timesheets, personId)) {
        return;
      }
      this.completeTodo(HQ_TODO_START_SHIFT);
      if (this.askIfDone) {
        this.askIfDone.ignore = true;
      }
      if (this.mayNotNeedRadio) {
        this.removeTodo(HQ_TODO_ISSUE_RADIO);
        this.addTodo(HQ_TODO_NO_RADIO, true);
      } else {
        this._scrollToAssets();
      }
    } catch (response) {
      this.errors.handleErrorResponse(response);
    }
  }

  /**
   * Did the operator switch to another person (or leave) while an update was in
   * flight? The controller is a singleton, so an unguarded continuation would
   * write one person's shift outcome onto another person's page.
   *
   * @param {object} timesheets the collection captured before the await
   * @param {string} personId the person id captured before the await
   * @returns {boolean}
   * @private
   */

  _personChanged(timesheets, personId) {
    return (this.isDestroying || this.isDestroyed
      || this.timesheets !== timesheets || this.person?.id !== personId);
  }

  _scrollToAssets() {
    this.scroll.scrollToElement('#assets');
    // The scroll above owns the viewport movement - don't let focus() fight it.
    schedule('afterRender', () => document.querySelector('#checkout-barcode')?.focus({preventScroll: true}));
  }

  /**
   * Called when the worker has ended a shift.
   * - Update the unverified timesheet list.
   * - Tell top level hq route to update the schedule summaries for the sidebar.
   */

  @action
  async endShiftNotify(timesheet, submitCorrection) {
    try {
      if (timesheet) {
        // A deleted entry (an accidental check-in) is not a handled shift.
        this.noShiftHandled = false;
      }
      const {timesheets} = this;
      const personId = this.person?.id;
      await timesheets.update();
      if (this._personChanged(timesheets, personId)) {
        return;
      }
      this._reconcileTimesheetsToReview();
      if (timesheet) {
        this.completeTodo(HQ_TODO_END_SHIFT);
        this.addTodo(HQ_TODO_VERIFY_TIMESHEET);
        if (SELF_SERVE_POG_POSITIONS.includes(timesheet.position_id)) {
          // The Cadre issues the pogs for these shifts, not the HQ Window.
          this.addTodo(HQ_TODO_MEAL_POG_SELF_SERVE, true);
        } else if (this.currentPeriodHasPass) {
          this.addTodo(HQ_TODO_MEAL_POG_NONE, true);
        } else {
          this.addTodo(HQ_TODO_MEAL_POG);
        }
        if (this.collectRadioCount) {
          // Radios may have been checked out after the todo list was built.
          this.addTodo(HQ_TODO_COLLECT_RADIO);
        }
        if (timesheet.position_id !== BURN_PERIMETER && !this.radioCount) {
          this.modal.info('No Radios Checked Out?',
            `It appears no radios were checked out for the shift. Please ask if they have a radio to return. If they have an authorized Event Radio, record it.`);
        }
      } else {
        // The entry was deleted - the person is off duty and back to square one.
        this.removeTodo(HQ_TODO_END_SHIFT);
        this.addTodo(HQ_TODO_START_SHIFT);
        this._setupRadioTodo();
      }
      this._updateTimesheetSummaries();
      this.endedShiftEntry = timesheet;
      if (submitCorrection) {
        this.correctionCallback?.(timesheet);
      }
    } catch (response) {
      this.errors.handleErrorResponse(response);
    }
  }

  /**
   * Ask the hq route to refresh the sidebar timesheet summaries. The action
   * lives on the parent route, and send() throws when the operator has already
   * navigated off the HQ pages while the update was in flight.
   *
   * @private
   */

  _updateTimesheetSummaries() {
    if (this.router.currentRouteName?.startsWith('hq.')) {
      this.send('updateTimesheetSummaries');
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
    const success = await this.saveModel.save({
      model: this.person,
      message: `${escapeHtml(this.person.callsign)} has been successfully marked ${isOnSite ? 'ON' : 'OFF'} SITE.`,
    });
    this.isMarkingOffSite = false;
    if (success && !isOnSite) {
      // Marking off site is a terminal HQ action - no shift is expected.
      this.noShiftHandled = false;
      this.completeTodo(HQ_TODO_OFF_SITE);
    }
  }

  /**
   * Attempt to mark a person off site. Pop up a dialog if items are outstanding (checked out radios, unverified
   * shifts, etc.)
   */

  @action
  markOffSite() {
    const {pendingItems} = this;

    if (pendingItems.length) {
      // Outstanding work - spell it out before the person walks away.
      this.modal.open(ModalSiteLeaveComponent, pendingItems, () => this._updateOnSite(false));
      return;
    }

    // No outstanding items -- confirm just to be sure.
    this.modal.confirm('Confirm Marking Person Off Site',
      `Are you sure you wish to mark ${escapeHtml(this.person.callsign)} as OFF SITE?`,
      () => this._updateOnSite(false)
    );
  }

  @action
  onPogIssue() {
    this.completeTodo(HQ_TODO_MEAL_POG);
  }

  /**
   * Everything still outstanding for the person, worded for display: what has to
   * be dealt with (still on duty, uncollected gear, unreviewed timesheet
   * entries), plus any suggested task not done yet.
   *
   * @returns {string[]}
   */

  get pendingItems() {
    const items = [];

    if (!this.isOffDuty) {
      items.push(`${this.person.callsign} is still on duty.`);
    }

    if (this.unreviewedTimesheetCount) {
      items.push(`${pluralize(this.unreviewedTimesheetCount, 'timesheet entry')} not reviewed.`);
    }

    if (this.assetsCheckedOut.length) {
      items.push(`${pluralize(this.assetsCheckedOut.length, 'asset')} (radios, gear, etc.) not collected.`);
    }

    this.todos.forEach((todo) => {
      if (!todo.completed && !todo.ignore && !PendingItemTasks.includes(todo.task)) {
        items.push(`Suggested task not done: ${todo.message}`);
      }
    });

    return items;
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
   * Re-open a todo that was completed but has become outstanding again (e.g. a
   * verified timesheet entry was un-verified).
   *
   * @param {string} task
   */

  @action
  reopenTodo(task) {
    this.addTodo(task);
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

    if (this.hasUnreviewedTimesheet) {
      this.setupTodo(HQ_TODO_VERIFY_TIMESHEET);
    }

    const {upcomingSlots} = model;

    if (!upcomingSlots.imminent.length && !upcomingSlots.upcoming.length) {
      this.askIfDone = new HqTodoTask(HQ_TODO_OFF_SITE, false, true);
    } else {
      this.askIfDone = null;
    }

    this.setupTodo(this.isOffDuty ? HQ_TODO_START_SHIFT : HQ_TODO_END_SHIFT);
    this._setupRadioTodo();
  }

  /**
   * Derive the radio task (if any) from the current radio accounting, duty
   * state, and whether the person may be handed a radio at all.
   *
   * @private
   */

  _setupRadioTodo() {
    const radioTask = computeRadioTodo({
      isOffDuty: this.isOffDuty,
      noMoreScheduled: !!this.askIfDone,
      accounting: this.radioAccounting,
      assetAuthorized: !!this.personEvent?.asset_authorized,
    });

    if (radioTask) {
      this.addTodo(radioTask);
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
      this.scroll.scrollToElement('#assets');
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
   * Does the person hold a BMID meal pass for the current event period?
   * Null-safe: the period may be missing or not one of pre/event/post.
   *
   * @returns {boolean}
   */

  get currentPeriodHasPass() {
    return !!this.eventPeriods?.[this.eventInfo?.event_period]?.hasPass;
  }

  /**
   * Should the Meals and Showers section be highlighted?
   *
   * @returns {boolean}
   */

  get highlightMealShowers() {
    if (!this.endedShiftEntry || this.currentPeriodHasPass) {
      return false;
    }

    // The Cadre issues the pogs for a self-serve shift - nothing to do here.
    return !SELF_SERVE_POG_POSITIONS.includes(this.endedShiftEntry.position_id);
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
