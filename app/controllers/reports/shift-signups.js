import Controller from '@ember/controller';
import { action, computed } from '@ember/object';
import _ from 'lodash';

export default class ReportsShiftSignupsController extends Controller {
  queryParams = ['year'];

  @computed('positions')
  get emptyPositions() {
    return _.orderBy(this.positions.filter((p) => p.total_empty > 0), ['total_empty'], ['desc']);
  }

  @action
  exportToCSV() {
    const rows = [];
    const CSV_COLUMNS = [
      { title: `${this.year} Position`, key: 'title' },
      { title: 'Begins', key: 'begins' },
      { title: 'Ends', key: 'ends' },
      { title: 'Description', key: 'description' },
      { title: 'Signed Up', key: 'signed_up' },
      { title: 'Max', key: 'max' }
    ];

    this.positions.forEach((position) => {
      const title = position.title;

      position.shifts.forEach((shift) => {
        rows.push({
          title,
          begins: shift.begins,
          ends: shift.ends,
          description: shift.description,
          signed_up: shift.signed_up,
          max: shift.max
        });
      });
    });

    this.house.downloadCsv(`${this.year}-shift-signups.csv`, CSV_COLUMNS, rows);
  }
}
