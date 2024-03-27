import Component from '@glimmer/component';
import {
  NOTE_TYPE_ADMIN,
  NOTE_TYPE_HQ_WORKER,
  NOTE_TYPE_USER,
  NOTE_TYPE_WRANGLER,
  NoteTypeLabels
} from "clubhouse/models/timesheet";
import {action} from '@ember/object';

export default class TimesheetNotesComponent extends Component {
  @action
  fromLabel(row) {
    if (!row.create_person) {
      return 'from The Clubhouse Timesheet Bot'
    }

    const type = row.type, callsign = row.create_person.callsign;

    if (this.args.isMe) {
      switch (type) {
        case NOTE_TYPE_USER:
          return 'from you';
        case NOTE_TYPE_HQ_WORKER:
          return `submitted for you by HQ Worker ${callsign}`;
        case NOTE_TYPE_WRANGLER:
          return `from Timesheet Wrangler ${callsign}`;
      }
    }

    if (type === NOTE_TYPE_USER || type === NOTE_TYPE_ADMIN) {
      return callsign;
    }

    return `${NoteTypeLabels[type] ?? type} ${callsign}`;
  }

  get lastNote() {
    const {notes} = this.args;
    return notes.length ? notes[notes.length - 1] : {};
  }
}
