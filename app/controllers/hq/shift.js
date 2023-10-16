import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {validatePresence} from 'ember-changeset-validations/validators';
import {ALPHA, BURN_PERIMETER} from 'clubhouse/constants/positions';
import {tracked} from '@glimmer/tracking';
import {
  HQ_TODO_COLLECT_RADIO,
  HQ_TODO_END_SHIFT, HQ_TODO_ISSUE_RADIO, HQ_TODO_MEAL_POG, HQ_TODO_MEAL_POG_NONE, HQ_TODO_NO_RADIO,
  HQ_TODO_START_SHIFT,
  HQ_TODO_VERIFY_TIMESHEET,
  HqTodoTask
} from "clubhouse/constants/hq-todo";
import {TYPE_RADIO} from "clubhouse/models/asset";

export default class HqShiftController extends ClubhouseController {
  @tracked isMarkingOffSite = false;

  @tracked timesheets;
  // @tracked unverifiedTimesheets = [];
  @tracked onDutyEntry;

  @tracked assets;
  @tracked eventInfo;

  @tracked todos = [];

  @tracked endedShiftEntry = null;

  @tracked firstTab;

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

  get unverifiedTimesheets() {
    return this.timesheets.filter((t) => t.isUnverified);
  }

  /**
   * Are there any unverified and not being ignored timesheet entries?
   * (used to determine if Start Shift can be shown)
   *
   * @returns {boolean}
   */

  get hasUnreviewedTimesheet() {
    return !!this.unverifiedTimesheets.find((t) => !t.isIgnoring);
  }

  /**
   * Count how many timesheet entries are left unverified.
   *
   * @returns {number}
   */

  get unreviewedTimesheetCount() {
    return this.unverifiedTimesheets.filter((t) => !t.isIgnoring).length;
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
    if (asset.description === TYPE_RADIO) {
      this.completeTodo(HQ_TODO_ISSUE_RADIO);
    }
  }

  /**
   * Called when an asset has been checked in.
   */

  @action
  onAssetCheckIn() {
    if (!this.shiftRadios) {
      this.completeTodo(HQ_TODO_COLLECT_RADIO);
    }
  }

  /**
   * How many radios are currently checked out?
   *
   * @returns {number}
   */

  get radioCount() {
    return this.assetsCheckedOut.filter((a) => a.asset.description === TYPE_RADIO).length;
  }

  /**
   * How many shift radios are checked out?
   * (only used for people who are not event radio eligible)
   *
   * @returns {number}
   */

  get shiftRadios() {
    return this.assetsCheckedOut.filter((a) => a.asset.description === TYPE_RADIO && !a.asset.perm_assign).length;
  }

  /**
   * How many event radios are checked out?
   *
   * @returns {number}
   */

  get eventRadios() {
    return this.assetsCheckedOut.filter((a) => a.asset.description === TYPE_RADIO && a.asset.perm_assign).length;
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
    this.completeTodo(HQ_TODO_START_SHIFT);

    try {
      await this.timesheets.update();
      this._findOnDuty();
      if (this.onDutyEntry?.position_id === BURN_PERIMETER) {
        this.removeTodo(HQ_TODO_ISSUE_RADIO);
        this.addTodo(HQ_TODO_NO_RADIO, true);
      }
    } catch (response) {
      this.house.handleErrorResponse(response);
    }
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
      //this.unverifiedTimesheets = this.timesheets.filter((t) => t.isUnverified);
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
    const todo = this.todos.find((t) => t.task === task);
    if (todo) {
      todo.completed = true;
    }
  }

  /**
   * Add a todo list item
   *
   * @param {string} task
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
    return this.todos.filter((t) => !t.completed && !t.ignore).length;
  }

  @action
  checkAssetCheckout(activeTabId, wantTabId, navigate) {
    if (activeTabId === 'assets') {
      this.assetCallback(navigate);
    } else {
      navigate();
    }
  }

  @action
  registerAssetCallback(callback) {
    this.assetCallback = callback;
  }
}
