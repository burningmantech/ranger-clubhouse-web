import ClubhouseController from "clubhouse/controllers/clubhouse-controller";
import {action} from '@ember/object';
import {cached, tracked} from '@glimmer/tracking';
import {ADMIN, ART_GRADUATE_BASE} from "clubhouse/constants/roles";

export default class TrainingMenteesController extends ClubhouseController {
  @tracked people;
  @tracked positions;
  @tracked isSubmitting;

  @cached
  get canRevokePositions() {
    return this.session.hasRole([ADMIN, ART_GRADUATE_BASE | this.training.id]);
  }

  @action
  revokePositions(person) {
    this.modal.confirm('Revoke Mentee Position(s)',
      `Are you sure you want to revoke the mentees position(s) from <b>${person.callsign}</b>?`,
      async () => {
        this.isSubmitting = true;
        try {
          await this.ajax.post(`training/${this.training.id}/revoke-mentee-positions/${person.id}`);
          person.positionsRevoked = true;
          this.toast.success('Mentee position(s) successfully revoked')
        } catch (response) {
          this.house.handleErrorResponse()
        } finally {
          this.isSubmitting = false;
        }
      })
  }

  @action
  exportToCSV() {
    const columns = [
      {key: 'callsign', title: 'Callsign'},
      {key: 'status', title: 'Status'},
    ];

    this.positions.forEach(p => {
      columns.push({key: `granted${p.id}`, title: 'Granted'});
      columns.push({key: `last_worked${p.id}`, title: 'Last Worked'});
    });

    const data = this.people.map((person) => {
      const row = {
        callsign: person.callsign,
        status: person.status,
      }

      person.positions.forEach(position => {
        if (position) {
          row[`granted${position.id}`] = position.granted;
          row[`last_worked${position.id}`] = position.last_worked;
        }
      });

      return row;
    });

    this.house.downloadCsv(`${this.training.title.replace(' Training', '').replaceAll(' ', '-')}-current-mentees.csv`, columns, data);
  }
}
