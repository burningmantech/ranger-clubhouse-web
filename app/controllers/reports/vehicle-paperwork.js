import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import { action } from '@ember/object';

export default class ReportsVehiclePaperworkController extends ClubhouseController {
    @action
    exportToCsv() {
      const year = this.house.currentYear();
      const CSV_COLUMNS = [
        { title: 'Callsign', key: 'callsign' },
        { title: 'Status', key: 'status' },
        { title: `${year} Motorpool Agreement`, key: 'signed_motorpool_agreement', yesno: true },
        { title: `${year} MVR Approved`, key: 'org_vehicle_insurance', yesno: true },
        { title: `${year} MVR Eligible`, key: 'is_mvr_eligible', yesno: true },
        { title: `${year} MVR Checkbox`, key: 'mvr_eligible', yesno: true },
        { title: `MVR Teams`, key: 'teams' },
        { title: `MVR Positions`, key: 'positions'},
      ];

      const people = this.people.map((p) => ({
        ...p,
        is_mvr_eligible: p.mvr_eligible || p.mvr_teams?.length || p.mvr_positions?.length,
        teams: p.mvr_teams ? p.mvr_teams.map((t) => t.title).join("\n") : '',
        positions: p.mvr_positions ? p.mvr_positions.map((t) => t.title).join("\n") : '',
      }));

      this.house.downloadCsv(`${year}-vehicle-paperwork.csv`, CSV_COLUMNS, people);
    }
}
