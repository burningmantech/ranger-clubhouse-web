import { action } from '@ember/object';
import {BmidStatusLabels} from "clubhouse/models/bmid";
import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';

const CSV_COLUMNS = [
  { title: 'Callsign', key: 'callsign'},
  { title: 'SAP', key: 'sap_date'},
  { title: 'BMID Status', key: 'bmid_status_label'},
  { title: 'On Site', key: 'on_site', yesno: true},
  { title: 'Radio Count', key : 'radio_count' },
  { title: 'Radio Barcode', key: 'radio_barcodes' },
  { title: 'Radio Type', key: 'radio_types' },
];

export default class ReportsEarlyArrivalController extends ClubhouseController {
  @action
  bmidStatusLabel(status) {
    return BmidStatusLabels[status] || `Unknown ${status}`;
  }

  @action
  exportToCSV() {
    this.arrivals.forEach((arrival) => {
      arrival.bmid_status_label = this.bmidStatusLabel(arrival.bmid_status);
      arrival.radio_barcodes = arrival.radios.map((r) => r.barcode).join("\n");
      arrival.radio_types = arrival.radios.map((r) => r.is_event_radio ? 'event' : 'shift').join("\n");
    })

    this.house.downloadCsv(`${this.house.currentYear()}-early-arrivals.csv`, CSV_COLUMNS, this.arrivals);
  }
}
