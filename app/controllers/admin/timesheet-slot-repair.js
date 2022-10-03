import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {tracked} from '@glimmer/tracking';
import {action} from '@ember/object';
import currentYear from 'clubhouse/utils/current-year';

export default class AdminTimesheetSlotRepairController extends ClubhouseController {
  @tracked haveResults = false;
  @tracked isSubmitting = false;
  @tracked entries;
  @tracked year;
  @tracked repairYear;

  @action
  runRepair() {
    this.isSubmitting = true;
    this.ajax.request('timesheet/repair-slot-assoc', {method: 'POST', data: {year: this.year}})
      .then(({entries}) => {
        this.entries = entries;
        this.haveResults = true;
        this.repairYear = this.year;
      }).catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.isSubmitting = false);
  }

  get yearOptions() {
    const years = [];

    for (let year = currentYear(); year >= 2010; year--) {
      years.push(year);
    }

    return years;
  }
}
