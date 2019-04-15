import Controller from '@ember/controller';
import { action } from '@ember-decorators/object';

export default class ReportsFreakingYearsController extends Controller {
  queryParams = [ 'showAll' ];

  showAll = 0;

  @action
  exportToCsv(group) {
    const CSV_COLUMNS = [
      { title: 'Callsign', key: 'callsign' },
      { title: 'Name', key: 'name' },
      { title: 'Years Rangered', key: 'years' },
      { title: 'First Year', key: 'first_year' },
      { title: 'Last Year', key: 'last_year' },
      { title: `Signed Up In ${this.signed_up_year}`, key: 'signed_up' }
    ];

    const data = group.people.map((row) => {
      return {
          callsign: row.callsign,
          name: `${row.first_name} ${row.last_name}`,
          years: row.years,
          first_year: row.first_year,
          last_year: row.last_year,
          signed_up: row.signed_up ? 'Y' : 'N'
      }
    });

    this.house.downloadCsv(`${this.signed_up_year}-freaking-${group.years}-years.csv`, CSV_COLUMNS, data);
  }
}
