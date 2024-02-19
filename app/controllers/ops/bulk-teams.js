import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {tracked} from '@glimmer/tracking';
import {action} from '@ember/object';

export default class OpsBulkTeamsController extends ClubhouseController {
  @tracked people;
  @tracked committed = false;
  @tracked teamId = null;
  @tracked teamTitle = '';
  @tracked successCount = 0;
  @tracked errorCount = 0;
  @tracked isSubmitting = false;

  grantRevokeOptions = [
    ['Grant Team', true],
    ['Revoke Team', false]
  ];

  get teamOptions() {
    const options = this.teams.map((p) => [p.title, p.id]);
    options.unshift(['Select a team', null]);
    return options;
  }

  @action
  async _execute(commit) {
    const callsigns = this.bulkForm.callsigns;
    this.teamId = +this.bulkForm.teamId;
    this.committed = false;
    const data = {
      callsigns,
      team_id: this.teamId,
      grant: this.bulkForm.grant ? 1 : 0,
      commit: commit ? 1 : 0
    };

    this.isSubmitting = true;
    this.granted = data.grant;

    this.errorCount = 0;
    this.successCount = 0;

    const team = this.teamsById[this.teamId];
    this.teamTitle = team ? team.title : `Team #${this.teamId}`;

    try {
      const {people} = await this.ajax.post(`team/${this.teamId}/bulk-grant-revoke`, {data});
      this.house.scrollToTop();
      this.people = people;
      if (commit && !this.errorCount) {
        this.committed = true;
        this.bulkForm.callsigns = '';
      }

      this.errorCount = people.filter((p) => p.errors).length;
      this.successCount = people.filter((p) => p.success).length;
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }

  @action
  commitAction() {
    this._execute(true);
  }

  @action
  verifyAction() {
    this._execute(false);
  }
}
