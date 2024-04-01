import ClubhouseController from "clubhouse/controllers/clubhouse-controller";
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import _ from "lodash";

const CSV_COLUMNS = [
  {title: 'Position', key: 'title'},
  {title: 'Shift Start', key: 'begins'},
  {title: 'Description', key: 'description'},
  {title: 'Callsign', key: 'callsign'},
];

export default class NoShowsReportsController extends ClubhouseController {
  @tracked year;
  @tracked positions;
  @tracked teamOptions;
  @tracked haveResults;
  @tracked isSubmitting;
  @tracked positionsSelected;
  @tracked noShowPositions;
  @tracked searchYear;

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
      const {positions} = await this.ajax.request('timesheet/no-shows-report', {
        data: {
          year: this.year,
          position_ids,
        }
      });
      this.haveResults = true;
      this.noShowPositions = positions;
      this.searchYear = this.year;
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }

  @action
  scrollToResults() {
    this.house.scrollToElement('#no-show-results');
  }

  @action
  exportToCSV(position) {
    const rows = [];

    position.slots.forEach((s) => {
      s.people.forEach((person) => {
        rows.push({
          title: position.title,
          begins: s.begins,
          description: s.description,
          callsign: person.callsign
        });
      });
    });

    this.house.downloadCsv(`${this.year}-no-shows-${position.title.replace(/ /g, '-')}.csv`, CSV_COLUMNS, rows);
  }
}
