import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';

const CSV_COLUMNS = [
  {title: 'Callsign', key: 'callsign'},
  {title: 'T-Shirts', key: 'tshirts'},
  {title: 'Long Sleeve Shirts', key: 'longSleeveShirt'},
  {title: 'Toaster Pins', key: 'toasterPins'},
  {title: 'Service Pins', key: 'servicePins'},
  {title: 'Service Patches', key: 'servicePatches'},
  {title: 'Org Patches', key: 'orgPatches'},
  {title: 'Other', key: 'other'}
];

export default class ReportsSwagDistributionController extends ClubhouseController {
  queryParams = ['year'];

  @action
  exportToCSV() {
    const rows = this.people.map((person) => {
      return {
        callsign: person.callsign,
        tshirts: this._buildColumn((person.tshirts)),
        longSleeveShirt: this._buildColumn((person.longSleeveShirt)),
        servicePins: this._buildColumn((person.servicePins)),
        servicePatches: this._buildColumn((person.servicePatches)),
        orgPatches: this._buildColumn((person.orgPatches)),
        toasterPins: this._buildColumn((person.toasterPins)),
        other: this._buildColumn((person.other)),
      };
    })

    this.house.downloadCsv(`${this.year}-swag-distribution.csv`, CSV_COLUMNS, rows);
  }

  _buildColumn(items) {
    return items.length ? items.map((item) => item.title).join("\n") : '-';
  }
}
