import ClubhouseController from "clubhouse/controllers/clubhouse-controller";
import {action} from '@ember/object';
import { tracked } from '@glimmer/tracking';

const CSV_COLUMNS = [
  {title: 'Callsign', key: 'callsign'},
  {title: 'Position', key: 'position_title'},
  {title: 'Shift Start', key: 'on_duty'},
  {title: 'Forced By', key: 'forced_by_callsign'},
  {title: 'Reason', key: 'reason'},
];

export default class ReportsForcedSigninsController extends ClubhouseController {
  queryParams = ['year'];

  @tracked entries;

  @action
  exportToCSV() {
    this.house.downloadCsv(`${this.year}-forced-signins.csv`, CSV_COLUMNS, this.entries);
  }
}
