import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import { action } from '@ember/object';

export default class ReportsAssetHistoryController extends ClubhouseController {
  queryParams = [ 'year' ];

  @action
  exportToCSV() {
    const CSV_COLUMNS = [
      { title: 'Barcode', key: 'barcode' },
      { title: 'Description', key: 'description' },
      { title: 'Assigned', key: 'assigned' },
      { title: 'Temp ID', key: 'temp_id' },
      { title: 'Checked Out', key: 'checked_out' },
      { title: 'Checked In', key: 'checked_in' },
      { title: 'Callsign', key: 'callsign' },
    ];

    const rows = [];

    this.assets.forEach((asset) => {
      asset.asset_history.forEach((history) => {
        rows.push({
          barcode: asset.barcode,
          description: asset.description,
          temp_id: asset.temp_id,
          assigned: asset.perm_assign ? 'Permanent' : 'Temporary',
          checked_out: history.checked_out,
          checked_in: history.checked_in,
          callsign: history.person.callsign
        });
      });
    });

    return this.house.downloadCsv(`${this.year}-assets-history-non-radio.csv`, CSV_COLUMNS, rows);
  }
}
