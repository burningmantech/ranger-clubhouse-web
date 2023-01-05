import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {cached, tracked} from '@glimmer/tracking';
import {ADMIN} from 'clubhouse/constants/roles';
import validateDateTime from 'clubhouse/validators/datetime';

export default class PersonWorkHistoryController extends ClubhouseController {
  @tracked person;
  @tracked timesheet;
  @tracked teamEntry;
  @tracked membershipHistory;
  @tracked teams;

  teamValidators = {
    joined_on: [validateDateTime({dateOnly: true})],
    left_on: [validateDateTime({dateOnly: true})]
  };


  get canManageTeamHistory() {
    return this.session.hasRole(ADMIN);
  }

  @cached
  get teamOptions() {
    return this.teams.map((team) => [team.active ? team.title : `${team.title} (inactive)`, team.id]);
  }


  @action
  newTeamHistory() {
    this.teamEntry = this.store.createRecord('person-position-log', {
      person_id: this.person.id,
      team_id: this.teams[0].id
    });
  }

  @action
  editTeamHistory(entry) {
    this.teamEntry = entry;
  }

  @action
  cancelTeamHistory() {
    this.teamEntry = null;
  }

  @action
  saveTeamHistory(entry, isValid) {
    if (!isValid) {
      return;
    }

    entry.save().then(() => {
      this.toast.success('Entry was successfully saved.');
      this.teamEntry = null;
      this.membershipHistory.update();
    }).catch((response) => this.house.handleErrorResponse(response));
  }

  @action
  deleteTeamHistory() {
    this.modal.confirm('Delete Team History Record', 'Are you sure you want to delete this record?', () => {
      this.teamEntry.destroyRecord().then(() => {
        this.teamEntry = null;
        this.toast.success('Team History record has been deleted.');
      })
    });
  }
}
