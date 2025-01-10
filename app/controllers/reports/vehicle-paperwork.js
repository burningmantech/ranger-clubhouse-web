import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {shiftFormat} from 'clubhouse/helpers/shift-format';

export default class ReportsVehiclePaperworkController extends ClubhouseController {
  @action
  exportToCsv() {
    const year = this.house.currentYear();
    const CSV_COLUMNS = [
      {title: 'Callsign', key: 'callsign'},
      {title: 'Status', key: 'status'},
      {title: `Motor Pool Protocol`, key: 'signed_motorpool_agreement', yesno: true},
      {title: `MVR Approved`, key: 'org_vehicle_insurance', yesno: true},
      {title: `MVR Eligible`, key: 'is_mvr_eligible', yesno: true},
      {title: `MVR Checkbox`, key: 'mvr_eligible', yesno: true},
      {title: `MVR Teams`, key: 'teams_list'},
      {title: `MVR Signed-Up Positions`, key: 'positions_list'},
      {title: `MVR Eligible Sign-Ups`, key: 'signup_list'},
      {title: 'PVR Eligible', key: 'is_pvr_eligible', yesno: true},
      {title: 'PVR Teams', key: 'pvr_teams_list'},
      {title: 'PVR Signed-Up Positions', key: 'pvr_positions_list'},
      {title: 'PVR Checkbox', key: 'pvr_eligible', yesno: true},
    ];


    const people = this.people.map((p) => ({
      ...p,
      is_mvr_eligible: p.mvr_eligible || p.mvr_teams?.length || p.mvr_positions?.length || p.mvr_signups?.length,
      teams_list: p.mvr_teams ? p.mvr_teams.map((t) => t.title).join("\n") : '',
      positions_list: p.mvr_positions ? p.mvr_positions.map((t) => t.title).join("\n") : '',
      signup_list: p.mvr_signups ? p.mvr_signups.map((t) => `${t.position_title} ${shiftFormat([t.begins], {})}`).join("\n") : '',
      is_pvr_eligible: p.pvr_eligible || p.pvr_teams?.length || p.pvr_positions?.length,
      pvr_teams_list: p.pvr_teams ? p.pvr_teams.map((t) => t.title).join("\n") : '',
      pvr_positions_list: p.pvr_positions ? p.pvr_positions.map((t) => t.title).join("\n") : '',
    }));

    this.house.downloadCsv(`${year}-vehicle-paperwork.csv`, CSV_COLUMNS, people);
  }
}
