import ClubhouseController from "clubhouse/controllers/clubhouse-controller";
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {buildBlockerAuditLabels} from "clubhouse/models/timesheet";
import {htmlSafe} from '@ember/template';

const CSV_COLUMNS = [
  {title: 'Callsign', key: 'callsign'},
  {title: 'Position', key: 'position_title'},
  {title: 'Shift Start', key: 'on_duty'},
  {title: 'Forced By', key: 'forced_by_callsign'},
  {title: 'Blockers', key: 'blockers'},
  {title: 'Reason', key: 'signin_force_reason'},
];

export default class ReportsForcedSigninsController extends ClubhouseController {
  queryParams = ['year'];

  @tracked entries;

  @action
  exportToCSV() {
    this.house.downloadCsv(`${this.year}-forced-signins.csv`, CSV_COLUMNS, this.entries);
  }

  forceReasons(blockers) {
    return htmlSafe(buildBlockerAuditLabels(blockers).map(blocker => `<div >${blocker}</div>`).join(''));
  }
}
