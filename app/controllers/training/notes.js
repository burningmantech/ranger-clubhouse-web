import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {tracked} from '@glimmer/tracking';
import {action} from '@ember/object';

const CSV_COLUMNS = [
  {title: 'Callsign', key: 'callsign'},
  {title: 'Status', key: 'status'},
  {title: 'Standing', key: 'standing'},
  {title: 'Session', key: 'begins'},
  {title: 'Description', key: 'description'},
  {title: 'Rank', key: 'rank'},
  {title: 'Notes', key: 'notes'},
];

export default class TrainingNotesController extends ClubhouseController {
  queryParams = ['year'];

  @tracked year;
  @tracked people;
  @tracked training;

  @action
  exportToCSV() {
    const rows = [];

    this.people.forEach((p) => {
      p.slots.forEach((s) => {
        rows.push({
          callsign: p.callsign,
          status: p.status,
          standing: p.standing,
          begins: s.begins,
          description: s.description,
          rank: s.rank ? s.rank : '',
          notes: s.notes.length > 1 ? s.notes.map((n, idx) => `Note #${idx+1}:\n${n}\n`) : s.notes[0],
        })
      });
    })

    this.house.downloadCsv(`${this.year}-trainee-notes`, CSV_COLUMNS, rows);
  }
}
