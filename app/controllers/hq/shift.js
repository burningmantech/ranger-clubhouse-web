import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {validatePresence} from 'ember-changeset-validations/validators';
import {ALPHA, BURN_PERIMETER} from 'clubhouse/constants/positions';
import {tracked} from '@glimmer/tracking';
import {
  HQ_TODO_COLLECT_RADIO, HQ_TODO_COLLECT_RADIO_IF_DONE,
  HQ_TODO_END_SHIFT, HQ_TODO_ISSUE_RADIO, HQ_TODO_MEAL_POG, HQ_TODO_MEAL_POG_NONE, HQ_TODO_NO_RADIO, HQ_TODO_OFF_SITE,
  HQ_TODO_START_SHIFT,
  HQ_TODO_VERIFY_TIMESHEET,
  HqTodoTask
} from "clubhouse/constants/hq-todo";
import {TYPE_RADIO} from "clubhouse/models/asset";
import {schedule} from '@ember/runloop';

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
    return this.timesheets.find((t) => t.position_id === ALPHA) && this.person.isActive;
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
    return this.shiftRadios + this.collectEventRadiosAtShiftEnd;
  }

  get collectEventRadiosAtShiftEnd() {
    if (this.eventRadios > this.eventInfo.radio_max) {
      return this.eventRadios - this.eventInfo.radio_max;
    } else {
      return 0;
    }
  }

  /**
   * How many event radios to collect at the end of the event?
   *
   * @return {number}
   */

  get collectEventRadios() {
    const count = this.eventRadios;

    return (count > this.eventInfo.radio_max) ? this.eventInfo.radio_max : count;
  }

  /**
   * How many shift radios are checked out?
   * (only used for people who are not event radio eligible)
   *
   * @returns {number}
   */

  get shiftRadios() {
    return this.assetsCheckedOut.filter((a) => a.asset.type === TYPE_RADIO && !a.asset.perm_assign).length;
  }

  /**
   * How many event radios are checked out?
   *
   * @returns {number}
   */

  get eventRadios() {
    return this.assetsCheckedOut.filter((a) => a.asset.type === TYPE_RADIO && a.asset.perm_assign).length;
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
  async endShiftNotify(timesheet) {
    try {
      await this.timesheets.update();
      const ignored = {}, previousReview = {};
      this.timesheetsToReview.forEach((t) => {
        previousReview[t.id] = true;
        if (t.isIgnoring) {
          ignored[t.id] = true;
        }
      })
      this.timesheetsToReview = this.timesheets.filter((t) => previousReview[t.id] || t.isUnverified);
      this.timesheetsToReview.forEach((t) => {
        if (ignored[t.id]) {
          t.isIgnoring = true;
        }
      });
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
    } catch (response) {
      this.house.handleErrorResponse(response);
    }
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

    return items++;
  }

  /**
   * Go ahead and force the off site even tho there are outstanding items.
   */

  @action
  forceMarkOffSite() {
    this._updateOnSite(false);
  }

  /**
   * Mark the person as on site.
   */

  @action
  markOnSite() {
    this._updateOnSite(true);
  }

  /**
   * Find the on duty entry
   *
   * @private
   */

  _findOnDuty() {
    this.onDutyEntry = this.timesheets.find((t) => t.off_duty == null);
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
   * Used by the route to build up the todo list.
   *
   * @param task
   */

  setupTodo(task) {
    this.todos.push(new HqTodoTask(task, false));
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
  updateBarocde(name, value) {
    this.unsubmittedBarcode = value?.trim();
  }

  @action
  closeUnsubmittedBarcodeDialog() {
    this.showUnsubmittedBarcodeDialog = false;
    this._scrollToAssets();
  }
}
