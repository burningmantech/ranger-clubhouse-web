import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import { action, setProperties } from '@ember/object';
import { cached, tracked } from '@glimmer/tracking';

export default class ReportsShiftLeadController extends ClubhouseController {
  queryParams = ['year'];

  @tracked dirtShiftTimes;
  @tracked shiftSelect;
  @tracked shiftStart;
  @tracked isLoading;

  // Positions and head counts - set via api result
  @tracked incoming_positions;
  @tracked below_min_positions;

  // People signed up - set via api result
  @tracked non_dirt_signups;
  @tracked command_staff_signups;
  @tracked dirt_signups;

  // Green Dot head counts - set via api result
  @tracked green_dot_total;
  @tracked green_dot_females;


  @action
  changeShift(option) {
    this.shiftSelect = option;

    const { shift } = option;
    const shift_start = shift.shift_start, shift_duration = shift.duration;

    this.shiftStart = shift_start;

    this.isLoading = true;
    this.ajax.request('slot/shift-lead-report', { data: { shift_start, shift_duration } })
      .then((result) => setProperties(this, result))
      .catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.isLoading = false);
  }

  @cached
  get shiftOptions() {
     return this.dirtShiftTimes.map((shift) => ({ shift, datetime: shift.shift_start }));
  }
}
