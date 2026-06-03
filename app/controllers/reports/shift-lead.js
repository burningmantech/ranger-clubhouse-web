import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {cached, tracked} from '@glimmer/tracking';
import dayjs from 'dayjs';
import Selectable from 'clubhouse/utils/selectable';
import {rehydrateBelowMin, rehydratePeople} from 'clubhouse/utils/shift-lead-report';
import _ from 'lodash';

export default class ReportsShiftLeadController extends ClubhouseController {
  queryParams = ['year'];

  // UI state
  @tracked dirtShiftTimes;
  @tracked shiftSelect;
  @tracked shiftStart;
  @tracked now;
  @tracked isLoading;
  @tracked isOnDuty = false;

  // Report view-model. Assigned wholesale from a normalized payload — never
  // splatted from the raw API response — so every field is declared, tracked,
  // and camelCased per the project convention.
  @tracked belowMinPositions = [];
  @tracked nonDirtSignups = [];
  @tracked commandStaffSignups = [];
  @tracked dirtSignups = [];
  @tracked greenDotTotal = 0;
  @tracked greenDotFemales = 0;

  formatSelected(selected) {
    return dayjs(selected).format('YYYY ddd MMM D @ HH:mm');
  }

  /**
   * Build a shift period list to pass to <LargeSelect>. Cached on
   * dirtShiftTimes (and shiftSelect, for the selected flag) so it is not
   * rebuilt on unrelated re-renders.
   *
   * @returns {object[]}
   */

  @cached
  get periodOptions() {
    const shifts = this.dirtShiftTimes ?? [];
    if (!shifts.length) {
      return [];
    }

    const periods = shifts.map((shift) => ({shift, datetime: shift.shift_start}));
    const dayGroups = _.groupBy(periods, (dt) => dayjs(dt.datetime).format('MMDD'));

    return Object.keys(dayGroups).sort().map((day) => {
      const dts = dayGroups[day];
      return {
        label: dayjs(dts[0].datetime).format('ddd MMM Do YYYY'),
        options: dts.map((period) => new Selectable({
          period,
          label: dayjs(period.datetime).format('ddd MMM D @ HH:mm'),
          selected: (this.shiftSelect === period.datetime),
        })),
      };
    });
  }

  /**
   * Clear the report view-model. Called before every fetch so stale rows from
   * the other mode (which has a different row shape) are never rehydrated or
   * rendered.
   *
   * @private
   */

  _resetReport() {
    this.belowMinPositions = [];
    this.nonDirtSignups = [];
    this.commandStaffSignups = [];
    this.dirtSignups = [];
    this.greenDotTotal = 0;
    this.greenDotFemales = 0;
  }

  /**
   * Shared loader for both report flavors. Fetches, normalizes the raw API
   * payload into the camelCased tracked view-model (no setProperties splat),
   * then rehydrates slot/position pointers with correct null-guards via a single
   * shared helper.
   *
   * @param {object} options {url, data, useSlot, isOnDuty}
   * @private
   */

  async _loadReport({url, data, useSlot, isOnDuty}) {
    this.isOnDuty = isOnDuty;
    this.isLoading = true;
    this._resetReport();

    try {
      const result = await this.ajax.request(url, data ? {data} : undefined);

      const {
        slots = {},
        positions = {},
        below_min_positions = [],
        non_dirt_signups = [],
        command_staff_signups = [],
        dirt_signups = [],
        green_dot_total = 0,
        green_dot_females = 0,
        now,
      } = result;

      this.greenDotTotal = green_dot_total;
      this.greenDotFemales = green_dot_females;

      this.belowMinPositions = rehydrateBelowMin(below_min_positions, {slots, positions, useSlot});
      this.nonDirtSignups = rehydratePeople(non_dirt_signups, {slots, positions, useSlot});
      this.commandStaffSignups = rehydratePeople(command_staff_signups, {slots, positions, useSlot});
      this.dirtSignups = rehydratePeople(dirt_signups, {slots, positions, useSlot});

      if (isOnDuty) {
        this.now = now;
        this.shiftStart = now;
      }
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Pull the Shift Lead Report for a selected (scheduled) shift period.
   *
   * @param option
   */

  @action
  changeShift(option) {
    const shift = option.period.shift;

    this.shiftSelect = option.period.datetime;
    this.shiftStart = shift.shift_start;

    this._loadReport({
      url: 'slot/shift-lead-report',
      data: {shift_start: shift.shift_start, shift_duration: shift.duration},
      useSlot: true,
      isOnDuty: false,
    });
  }

  /**
   * Pull the "currently on duty" Shift Lead Report.
   */

  @action
  onDutyAction() {
    this.shiftSelect = 'now';

    this._loadReport({
      url: 'timesheet/on-duty-shift-lead-report',
      useSlot: false,
      isOnDuty: true,
    });
  }
}
