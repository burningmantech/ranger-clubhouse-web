import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import currentYear from "clubhouse/utils/current-year";

export default class ReportsServiceYearsController extends ClubhouseController {
  get totalPeople() {
    let total = 0;
    this.serviceYears.forEach((serviceYear) => total += serviceYear.people.length);
    return total;
  }

  @action
  exportToCsv() {
    const CSV_COLUMNS = [
      {title: 'Callsign', key: 'callsign'},
      {title: 'Last Name', key: 'last_name'},
      {title: 'First Name', key: 'first_name'},
      {title: 'Total Years of Service', key: 'tally'},
      {title: 'First Year', key: 'first_year'},
      {title: 'Last Year', key: 'last_year'}
    ];

    const people = [];

    this.serviceYears.forEach((serviceYear) => {
      serviceYear.people.forEach((row) => {
        people.push({
          callsign: row.callsign,
          first_name: row.first_name,
          last_name: row.last_name,
          tally: row.years_of_service ? row.years_of_service.length : 0,
          first_year: row.first_year,
          last_year: row.last_year
        });
      })
    })

    people.sort((a, b) => {
      const lastCmp = a.last_name.localeCompare(b.last_name);

      if (!lastCmp) {
        return a.first_name.localeCompare(b.first_name);
      } else {
        return lastCmp;
      }
    });

    this.house.downloadCsv(`${currentYear()}-service-years.csv`, CSV_COLUMNS, people);
  }
}
