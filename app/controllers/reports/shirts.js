import Controller from '@ember/controller';
import { action } from '@ember-decorators/object';

export default class ReportsShirtsController extends Controller {
  queryParams = [ 'year' ];

  @action
  exportPeople() {
    const CSV_COLUMNS = [
      { title: 'Callsign', key: 'callsign' },
      { title: 'Full Name', key: 'name' },
      { title: `Hours in ${this.year}`, key: 'hours' },
      { title: `T-Shirt Shirt (${this.threshold_ss} hrs)`, key: 'short_sleeve' },
      { title: `Long Sleeve Shirt (${this.threshold_ls} hrs)`, key: 'long_sleeve' },
    ];

    const data = this.people.map((row) => {
      return {
        callsign: row.callsign,
        name: `${row.first_name} ${row.last_name}`,
        hours: row.hours,
        short_sleeve: row.earned_ss ? row.teeshirt_size_style : 'not earned',
        long_sleeve: row.earned_ls ? row.longsleeveshirt_size_style : 'not earned',
      }
    });
    this.house.downloadCsv(`${this.year}-earn-shirts.csv`, CSV_COLUMNS, data);
  }

  @action
  exportCounts(shirts) {
    const CSV_COLUMNS = [
      { title: 'Shirt Type', key: 'type' },
      { title: 'Count', key: 'count' },
    ];

    this.house.downloadCsv(`${this.year}-${shirts.exportName}-counts.csv`, CSV_COLUMNS, shirts.types);
  }
}
