import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import { action } from '@ember/object';

export default class ReportsAssetsOutstandingController extends ClubhouseController {
  queryParams = ['year'];

  @action
  exportToCSV() {
    const CSV_COLUMNS = [
      { title: 'Barcode', key: 'barcode' },
      { title: 'Description', key: 'description' },
      { title: 'Attachment', key: 'attachment' },
      { title: 'Temp ID', key: 'temp_id' },
      { title: 'Checked Out', key: 'checked_out' },
      { title: 'Callsign', key: 'callsign' },
    ];

    const rows = this.assets.map((asset) => {
        return {
          barcode: asset.barcode,
          description: asset.description,
          temp_id: asset.temp_id,
          assigned: asset.perm_assign ? 'Permanent' : 'Temporary',
          attachment: asset.checked_out.attachment ? asset.checked_out.attachment.description : '-',
          checked_out: asset.checked_out.checked_out,
          callsign: asset.checked_out.person ? asset.checked_out.person.callsign : `Deleted #${asset.checked_out.person_id}`
        };
    });

    return this.house.downloadCsv(`${this.year}-assets-outstanding.csv`, CSV_COLUMNS, rows);
  }
}
