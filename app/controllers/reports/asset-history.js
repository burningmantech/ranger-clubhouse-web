import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import { action } from '@ember/object';
import {TypeLabels} from 'clubhouse/models/asset';

export default class ReportsAssetHistoryController extends ClubhouseController {
  queryParams = [ 'year' ];

  typeLabel(type) {
    return TypeLabels[type] ?? type;
  }

  @action
  exportToCSV() {
    const CSV_COLUMNS = [
      { title: 'Barcode', key: 'barcode' },
      { title: 'Type', key: 'type' },
      { title: 'Description', key: 'description' },
      { title: 'Assigned', key: 'assigned' },
      { title: 'Checked Out', key: 'checked_out' },
      { title: 'Checked In', key: 'checked_in' },
      { title: 'Callsign', key: 'callsign' },
    ];

    const rows = [];

    this.assets.forEach((asset) => {
      asset.asset_history.forEach((history) => {
        rows.push({
          barcode: asset.barcode,
          type: asset.type,
          description: asset.description,
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
