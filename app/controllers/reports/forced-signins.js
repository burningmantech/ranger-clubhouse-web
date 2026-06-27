import ClubhouseController from "clubhouse/controllers/clubhouse-controller";
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {buildBlockerAuditLabels} from "clubhouse/models/timesheet";

const CSV_COLUMNS = [
  {title: 'Person', key: 'callsign'},
  {title: 'Position', key: 'position_title'},
  {title: 'Shift Start', key: 'on_duty'},
  {title: 'Forced By', key: 'forced_by_callsign'},
  {title: 'Blockers', key: 'blockers_human'},
  {title: 'Reason', key: 'signin_force_reason'},
];

export default class ReportsForcedSigninsController extends ClubhouseController {
  queryParams = ['year'];

  @tracked entries;

  @action
  exportToCSV() {
    const rows = this.entries.map((e) => ({...e, blockers_human: buildBlockerAuditLabels(e.blockers).join("\n")}));
    this.download.downloadCsv(`${this.year}-forced-signins.csv`, CSV_COLUMNS, rows);
  }

  forceReasons(blockers) {
    return buildBlockerAuditLabels(blockers);
  }
}
