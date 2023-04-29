import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {cached, tracked} from '@glimmer/tracking';

export default class AdminRangerRetentionController extends ClubhouseController {
  @tracked topEarners = [];
  @tracked haveResults = false;
  @tracked isSubmitting = false;
  @tracked startYear = 0;
  @tracked endYear = 0;
  @tracked topLimit = 0;
  @tracked topForm;

  limitOptions = [50, 100, 150, 200, 250, 300, 350, 400, 450, 500];

  @cached
  get yearOptions() {
    const years = [];
    for (let year = 2010; year <= this.house.currentYear(); year++) {
      if (year !== 2020 && year !== 2021) {
        years.push(year);
      }
    }
    years.reverse();
    return years;
  }

  @cached
  get yearRange() {
    const years = [];
    for (let year = this.startYear; year <= this.endYear; year++) {
      if (year !== 2020 && year !== 2021) {
        years.push(year);
      }
    }

    return years;
  }

  @action
  async runReportAction() {
    const form = this.topForm;
    const limit = parseInt(form.limit),
      start_year = parseInt(form.startYear),
      end_year = parseInt(form.endYear);

    if (start_year > end_year) {
      this.modal.info(null, 'The starting year must be less than or equal to the ending year.');
      return;
    }

    if (limit <= 0) {
      this.modal.info(null, 'Limit must not be negative');
      return;
    }

    this.isSubmitting = true;
    this.haveResults = false;
    try {
      const {top_earners} = await this.ajax.request('timesheet/top-hour-earners', {data: {start_year, end_year, limit}});
      this.startYear = start_year;
      this.endYear = end_year;
      this.topLimit = limit;
      this.topEarners = top_earners;
      this.haveResults = true;
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }

  @action
  exportToCsv() {
    const CSV_COLUMNS = [
      {title: 'Callsign', key: 'callsign'},
      {title: 'Name', key: 'name'},
      {title: 'Status', key: 'status'},
      {title: 'Email', key: 'email'},
      {title: 'Top Hour', key: 'top_hour'},
      {title: 'Top Year', key: 'top_year'},
    ];

    this.yearRange.forEach((year) => CSV_COLUMNS.push({title: year, key: `year_${year}`}));
    this.topEarners.forEach((person) => {
      person.name = `${person.first_name} ${person.last_name}`;
      person.top_hour = (+person.top_duration / 3600.0).toFixed(2);
      person.years.forEach((event) => person[`year_${event.year}`] = (+event.duration / 3600.0).toFixed(2))
    });
    this.house.downloadCsv(`top-earners-${this.startYear}-${this.endYear}.csv`, CSV_COLUMNS, this.topEarners);
  }
}
