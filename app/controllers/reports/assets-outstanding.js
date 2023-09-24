import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import { action } from '@ember/object';
import {TypeLabels} from 'clubhouse/models/asset';

export default class ReportsAssetsOutstandingController extends ClubhouseController {
  queryParams = ['year'];

  typeLabel(type) {
    return TypeLabels[type] ?? type;
  }

  @action
  exportToCSV() {
    const CSV_COLUMNS = [
      { title: 'Barcode', key: 'barcode' },
      { title: 'Type', key: 'type' },
      { title: 'Description', key: 'description' },
      { title: 'Attachment', key: 'attachment' },
      { title: 'Checked Out', key: 'checked_out' },
      { title: 'Callsign', key: 'callsign' },
    ];

    const rows = this.assets.map((asset) => {
        return {
          barcode: asset.barcode,
          type: asset.type,
          description: asset.description,
          assigned: asset.perm_assign ? 'Permanent' : 'Temporary',
          attachment: asset.checked_out.attachment ? asset.checked_out.attachment.description : '-',
          checked_out: asset.checked_out.checked_out,
          callsign: asset.checked_out.person ? asset.checked_out.person.callsign : `Deleted #${asset.checked_out.person_id}`
        };
    });

    return this.house.downloadCsv(`${this.year}-assets-outstanding.csv`, CSV_COLUMNS, rows);
  }
}
