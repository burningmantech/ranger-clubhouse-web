import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {tracked} from '@glimmer/tracking';
import {action} from '@ember/object';

export default class OpsBulkPositionsController extends ClubhouseController {
  @tracked people;
  @tracked committed = false;
  @tracked positionId = null;
  @tracked positionTitle = '';
  @tracked successCount = 0;
  @tracked errorCount = 0;
  @tracked isSubmitting = false;
  @tracked granted;

  grantRevokeOptions = [
    ['Grant Position', true],
    ['Revoke Position', false]
  ];

  get positionOptions() {
    const options = this.positions.map((p) => [p.title, p.id]);
    options.unshift(['Select a position', null]);
    return options;
  }

  @action
  async _execute(commit) {
    const callsigns = this.bulkForm.callsigns;

    this.positionId = +this.bulkForm.positionId;
    this.committed = false;
    const data = {
      callsigns,
      position_id: this.positionId,
      grant: this.bulkForm.grant ? 1 : 0,
      commit: commit ? 1 : 0
    };

    this.isSubmitting = true;
    this.granted = data.grant;

    this.errorCount = 0;
    this.successCount = 0;

    const position = this.positionsById[this.positionId];
    this.positionTitle = position ? position.title : `Position #${this.positionId}`;

    try {
      const {people} = await this.ajax.post(`position/${this.positionId}/bulk-grant-revoke`, {data});
      this.people = people;
      if (commit && !this.errorCount) {
        this.committed = true;
      }

      this.errorCount = people.filter((p) => p.errors).length;
      this.successCount = people.filter((p) => p.success).length;
      this.house.scrollToTop();
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
