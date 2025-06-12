import ClubhouseController from "clubhouse/controllers/clubhouse-controller";
import {cached, tracked} from '@glimmer/tracking';
import {action} from '@ember/object';

const CSV_COLUMNS = [
  {title: 'Callsign', key: 'callsign'},
  {title: 'Position', key: 'position_title'},
  {title: 'On Duty', key: 'on_duty'},
  {title: 'Via', key: 'via'},
  {title: 'Type', key: 'type'},
  {title: 'By (minutes)', key: 'by'},
  {title: 'Shift Start', key: 'slot_begins'},
  {title: 'Shift Description', key: 'slot_description'},
];

export default class ReportsEarlyLateCheckinsController extends ClubhouseController {
  queryParams = ['year'];

  @tracked early_check_in;
  @tracked entries;
  @tracked late_check_in;
  @tracked people;
  @tracked positionFilter;
  @tracked positionOptions;
  @tracked positions;
  @tracked year;

  @cached
  get entriesView() {
    if (this.positionFilter === 'all') {
      return this.entries;
    }

    const id = +this.positionFilter;
    return this.entries.filter((e) => e.position.id === id);
  }

  @action
  exportToCSV() {
    const rows = this.entriesView.map((e) => ({
      callsign: e.person.callsign,
      position_title: e.position.title,
      on_duty: e.timesheet.on_duty,
      type: e.type,
      by: e.distance,
      slot_begins: e.slot.begins,
      slot_description: e.slot.description,
      via: e.createdVia
    }));

    this.house.downloadCsv(`${this.year}-early-late-checkins`, CSV_COLUMNS, rows);
  }
}
