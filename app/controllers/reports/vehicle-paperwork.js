import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import { action } from '@ember/object';

export default class ReportsVehiclePaperworkController extends ClubhouseController {
    @action
    exportToCsv() {
      const year = this.house.currentYear();
      const CSV_COLUMNS = [
        { title: 'Callsign', key: 'callsign' },
        { title: 'Status', key: 'status' },
        { title: `${year} Motorpool Agreement`, key: 'signed_motorpool_agreement', yesno: true },
        { title: `${year} Motor Vehicle Record (MVR)`, key: 'org_vehicle_insurance', yesno: true },
      ];

      this.house.downloadCsv(`${year}-vehicle-paperwork.csv`, CSV_COLUMNS, this.people);
    }
}
