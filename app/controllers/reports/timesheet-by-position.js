import Controller from '@ember/controller';
import { action, set } from '@ember/object';
import { run, later } from '@ember/runloop';

export default class ReportsTimesheetByPositionController extends Controller {
  queryParams = ['year'];

  @action
  togglePosition(position) {
    set(position, 'showing', !position.showing);
  }

  @action
  toggleExpandAll() {
    this.set('isExpanding', true);
    later(() => {
      run.schedule('afterRender', () => {
        this.set('expandAll', !this.expandAll);
        this.positions.forEach((p) => set(p, 'showing', this.expandAll));
        run.schedule('afterRender', () => {
          this.set('isExpanding', false);
        });
      });
    }, 10);

  }

  @action
  exportToCSV(position) {
    const CSV_COLUMNS = [
      { title: 'From', key: 'on_duty' },
      { title: 'To', key: 'off_duty' },
      { title: 'Hours', key: 'hours' },
      { title: 'Callsign', key: 'callsign' },
    ];

    if (this.house.canViewEmail) {
      CSV_COLUMNS.push({ title: 'Email', key: 'email' });
    }

    const rows = position.timesheets.map((entry) => {
      const row = {
        callsign: entry.person.callsign,
        on_duty: entry.on_duty,
        off_duty: entry.off_duty,
        hours: (entry.duration / 3600.0).toFixed(2),
      };

      if (this.house.canViewEmail) {
        row.email = entry.person.email;
      }

      return row;
    });

    this.house.downloadCsv(`${this.year}-${position.title.replace(/ /g,'-')}.csv`, CSV_COLUMNS, rows);
  }
}
