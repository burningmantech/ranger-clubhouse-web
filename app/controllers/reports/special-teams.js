import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {positionLabel} from 'clubhouse/helpers/position-label';
import _ from "lodash";

export default class ReportsSpecialTeamsController extends ClubhouseController {
  @tracked isSubmitting = false;
  @tracked haveResults = false;
  @tracked startYear;
  @tracked endYear;
  @tracked positionsUsed;
  @tracked totalsList;
  @tracked grandTotal;
  @tracked people;

  get positionOptions() {
    return this.positions.map((p) => [positionLabel([p, true]), p.id]);
  }

  get teamColumns() {
    return _.chunk(this.teamOptions, this.teamOptions.length / 4);
  }

  get yearOptions() {
    const endYear = this.house.currentYear();

    const years = [];
    for (let year = endYear; year >= 2010; year--) {
      if (year === 2020 || year === 2021) {
        continue;
      }
      years.push(year);
    }
    return years;
  }

  get yearList() {
    const start = this.startYear, end = this.endYear;

    const years = [];
    for (let year = start; year <= end; year++) {
      if (year === 2020 || year === 2021) {
        continue;
      }
      years.push(year);
    }

    return years;
  }

  @action
  async searchTeamsAction() {
    const form = this.teamsForm;
    const position_ids = [],
      include_inactive = form.showInactives ? 1 : 0,
      start_year = parseInt(form.startYear),
      end_year = parseInt(form.endYear);

    this.teamOptions.forEach((t) => {
      t.positionOptions.forEach((p) => {
        if (p.isChecked) {
          position_ids.push(p.id);
        }
      })
    });

    if (!position_ids.length) {
      this.modal.info('No Selected Positions', 'Select the positions you wish to report on.');
      return;
    }

    if (start_year > end_year) {
      this.modal.info(null, 'The starting year must be less than or equal to the ending year.');
      return;
    }

    this.isSubmitting = true;
    try {
      const {people} = await this.ajax.request('timesheet/special-teams', {
        method: 'POST',
        data: {position_ids, include_inactive, start_year, end_year}
      });
      this.people = people;
      this.haveResults = true;
      this.startYear = start_year;
      this.endYear = end_year;

      this.positionsUsed = this.positions.filter((p) => position_ids.includes(p.id));

      const totals =[];

      for (let year = start_year, i = 0; year <= end_year; year++) {
        if (year === 2020 || year === 2021) {
          continue;
        }
        totals[i++] = 0;
      }

      this.people.forEach((p) => {
        p.years.forEach((total, idx) => {
          totals[idx] += total;
        });
      });

      this.totalsList = totals;
      this.grandTotal = this.people.reduce((total, p) => p.total_duration + total, 0);
    } catch (response) {
      this.house.handleErrorResponse(response)
    } finally {
      this.isSubmitting = false;
    }
  }

  @action
  exportToCSV() {
    const columns = [
      {title: 'Callsign', key: 'callsign'},
      {title: 'Name', key: 'name'},
      {title: 'Status', key: 'status'},
      {title: 'Email', key: 'email'}
    ];

    this.yearList.forEach((year) => {
      columns.push({title: `${year} Hours`, key: year.toString()});
    });

    columns.push({title: 'Total', key: 'total'});

    const rows = this.people.map((person) => {
      const row = {
        callsign: person.callsign,
        name: `${person.first_name} ${person.last_name}`,
        status: person.status,
        email: person.email,
        total: (person.total_duration / 3600.0).toFixed(2)
      };

      this.yearList.forEach((year, idx) => {
        row[year.toString()] = (person.years[idx] / 3600.0).toFixed(2);
      });

      return row;
    });

    this.house.downloadCsv(`special-teams-${this.startYear}-${this.endYear}`, columns, rows);
  }

  @action
  scrollToOnRender() {
    this.house.scrollToElement('#people');
  }
}
