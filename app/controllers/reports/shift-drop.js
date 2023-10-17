import ClubhouseController from "clubhouse/controllers/clubhouse-controller";
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import _ from "lodash";

const CSV_COLUMNS = [
  {title: 'Position', key: 'position_title'},
  {title: 'Callsign', key: 'callsign'},
  {title: 'Shift Start', key: 'begins'},
  {title: 'Callsign', key: 'callsign'},
  {title: 'Hours Dropped Before', key: 'hours_before'},
  {title: 'Dropped At', key: 'dropped_at'}
];

const HOUR_OPTIONS = [
  ['1 hour', 1],
  ['6 hours', 6],
  ['12 hours', 12],
  ['24 hours', 24],
];

export default class ReportsShiftDropController extends ClubhouseController {
  @tracked year;
  @tracked positions;
  @tracked teamOptions;
  @tracked haveResults;
  @tracked isSubmitting;
  @tracked people;
  @tracked positionsSelected;
  @tracked hours;

  hourOptions = HOUR_OPTIONS;

  get teamColumns() {
    return _.chunk(this.teamOptions, this.teamOptions.length / 4);
  }

  get yearOptions() {
    const year = this.house.currentYear();
    const years = [];

    for (let y = 2019; y <= year; y++) {
      if (y === 2020 || y === 2021) {
        continue;
      }
      years.push(y);
    }

    years.reverse();
    return years;
  }

  @action
  async submit() {
    const position_ids = [];

    this.positionsSelected = []
    this.teamOptions.forEach((t) => {
      t.positionOptions.forEach((p) => {
        if (p.isChecked) {
          position_ids.push(p.id);
          this.positionsSelected.push(p.title);
        }
      })
    });

    if (!position_ids.length) {
      this.modal.info('No Selected Positions', 'Select the positions you wish to report on.');
      return;
    }

    this.positionsSelected.sort();

    try {
      this.isSubmitting = true;
      const {people} = await this.ajax.request('timesheet/shift-drop-report', {
        data: {
          year: this.year,
          position_ids,
          hours: this.hours
        }
      });
      this.haveResults = true;
      this.people = people;
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }

  @action
  scrollToResults() {
    this.house.scrollToElement('#drop-results');
  }

  @action
  exportToCSV() {
    this.house.downloadCsv(`${this.year}-shift-drops.csv`, CSV_COLUMNS, this.people);
  }
}
