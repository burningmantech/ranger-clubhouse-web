import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import { action } from '@ember/object';

export default class ReportsAlphaShirtsController extends ClubhouseController {
  @action
  exportPeople() {
    const CSV_COLUMNS = [
      { title: `${this.year} Callsign`, key: 'callsign' },
      { title: 'Status', key: 'status' },
      { title: 'First Name', key: 'first_name' },
      { title: 'Last Name', key: 'last_name' },
      { title: `Email`, key: 'email' },
      { title: `T-Shirt Shirt`, key: 'teeshirt_size_style' },
      { title: `Long Sleeve Shirt`, key: 'longsleeveshirt_size_style' },
    ];

    this.house.downloadCsv(`${this.year}-alpha-shirts.csv`, CSV_COLUMNS, this.alphas);
  }

  @action
  exportCounts(shirts) {
    const CSV_COLUMNS = [
      { title: 'Shirt Type', key: 'type' },
      { title: 'Count', key: 'count' },
    ];

    this.house.downloadCsv(`${this.year}-alpha-${shirts.exportName}-counts.csv`, CSV_COLUMNS, shirts.types);
  }
}
