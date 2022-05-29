import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action, setProperties} from '@ember/object';
import {cached, tracked} from '@glimmer/tracking';
import {DIRT_SHINY_PENNY} from 'clubhouse/constants/positions';
import dayjs from 'dayjs';
import Selectable from 'clubhouse/utils/selectable';
import _ from 'lodash';

export default class ReportsShiftLeadController extends ClubhouseController {
  queryParams = ['year'];

  @tracked dirtShiftTimes;
  @tracked shiftSelect;
  @tracked shiftStart;
  @tracked now;
  @tracked isLoading;
  @tracked isOnDuty = false;

  // Positions and head counts - set via api result
  @tracked incoming_positions;
  @tracked belowMinPositions;

  // People signed up - set via api result
  @tracked non_dirt_signups;
  @tracked command_staff_signups;
  @tracked dirt_signups;

  // Green Dot head counts - set via api result
  @tracked green_dot_total;
  @tracked green_dot_females;

  formatSelected(selected) {
    return dayjs(selected).format('YYYY ddd MMM D @ HH:mm');
  }

  /**
   * Build a shift period list to pass to <LargeSelect>
   * @returns {[]}
   */

  get periodOptions() {
    const periods =  this.dirtShiftTimes.map((shift) => ({shift, datetime: shift.shift_start}));
    const dayGroups = _.groupBy(periods, (dt) => dayjs(dt.datetime).format('MMDD'));

    const groups = [];

    for (const day in dayGroups) {
      const dts = dayGroups[day];
      groups.push({
        label: dayjs(dts[0].datetime).format('ddd MMM Do YYYY'),
        options: dts.map((period) => (new Selectable({
          period,
          label: dayjs(period.datetime).format('ddd MMM D @ HH:mm'),
          selected: (this.shiftSelect === period.datetime),
        })))
      })
    }

    return groups;
  }

  /**
   * Pull the Shift Lead Report for a selected shift period.
   *
   * @param option
   */

  @action
  changeShift(option) {
    this.shiftSelect = option.period.datetime;

    const shift = option.period.shift;

    const shift_start = shift.shift_start, shift_duration = shift.duration;

    this.shiftStart = shift_start;
    this.isOnDuty = false;
    this.isLoading = true;
    this.ajax.request('slot/shift-lead-report', {data: {shift_start, shift_duration}})
      .then((result) => {
        setProperties(this, result);
        this._rehydrateResults();
      })
      .catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.isLoading = false);
  }

  @action
  onDutyAction() {
    this.shiftSelect = 'now';
    this.isOnDuty = true;
    this.isLoading = true;
    this.ajax.request('timesheet/on-duty-shift-lead-report')
      .then((result) => {
        setProperties(this, result);
        this._rehydrateOnDutyResults(true);
        this.shiftStart = this.now;
      })
      .catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.isLoading = false);
  }

  /**
   * Rehydrate the various slot and positions references.
   *
   * @private
   */

  _rehydrateResults() {
    const {slots, positions, below_min_positions} = this;

    this.belowMinPositions = below_min_positions.map((slotId) => {
      const slot = slots[slotId];
      const position = positions[slot.position_id];

      if (!slot || !positions) {
        return {};
      }
      return {
        title: position.title,
        slot_begins: slot.begins,
        slot_ends: slot.ends,
        min: slot.min,
        max: slot.max,
        signed_up: slot.signed_up,
      }
    });

    this.belowMinPositions.sort((a, b) => a.title.localeCompare(b.title));

    this._rehydratePeople(this.non_dirt_signups);
    this._rehydratePeople(this.command_staff_signups);
    this._rehydratePeople(this.dirt_signups);
  }

  /**
   * Rehydrate the callsign rows with the slot & positions. Sort by position title, shift start, and years rangered.
   *
   * @param {[]} people
   * @private
   */

  _rehydratePeople(people) {
    const {slots, positions} = this;
    people.forEach((person) => {
      const slot = slots[person.slot_id];
      person.slot = slot;
      person.position = positions[slot.position_id];
    });

    /*
      Sort priority is
      1) Position title search in descending order, placing shiny pennies at the very end
      2) Shift starting time ascending order
      3) Years rangered in descending order.
     */

    people.sort((a, b) => {
      const titleA = a.slot.position_id === DIRT_SHINY_PENNY ? '1111' : a.position.title;
      const titleB = b.slot.position_id === DIRT_SHINY_PENNY ? '1111' : b.position.title;

      const titleCompare = -titleA.localeCompare(titleB);
      if (titleCompare) {
        return titleCompare;
      }

      const beginsCompare = a.slot.begins.localeCompare(b.slot.begins);
      if (beginsCompare) {
        return beginsCompare;
      }

      return -(a.years - b.years);
    });
  }

  /**
   * Rehydrate the various slot and positions references.
   *
   * @private
   */

  _rehydrateOnDutyResults() {
    const {positions, below_min_positions} = this;

    below_min_positions.forEach((row) => {
      const position = positions[row.position_id];
      row.title = position.title ?? `Position #${row.position_id}`;
    });

    this.belowMinPositions = below_min_positions;
    this.belowMinPositions.sort((a, b) => a.title.localeCompare(b.title));

    this._rehydrateOnDutyPeople(this.non_dirt_signups);
    this._rehydrateOnDutyPeople(this.command_staff_signups);
    this._rehydrateOnDutyPeople(this.dirt_signups);
  }

  /**
   * Rehydrate the callsign rows with the slot & positions. Sort by position title, shift start, and years rangered.
   *
   * @param {[]} people
   * @private
   */

  _rehydrateOnDutyPeople(people) {
    const {positions} = this;
    people.forEach((person) => person.position = positions[person.position_id]);

    /*
      Sort priority is
      1) Position title search in descending order, placing shiny pennies at the very end
      2) Years rangered in descending order.
     */

    people.sort((a, b) => {
      const titleA = a.position_id === DIRT_SHINY_PENNY ? '1111' : a.position.title;
      const titleB = b.position_id === DIRT_SHINY_PENNY ? '1111' : b.position.title;

      const titleCompare = -titleA.localeCompare(titleB);
      if (titleCompare) {
        return titleCompare;
      }
      return -(a.years - b.years);
    });
  }

}
