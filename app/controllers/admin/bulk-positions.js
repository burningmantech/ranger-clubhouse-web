import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {tracked} from '@glimmer/tracking';
import {action} from '@ember/object';

export default class AdminBulkPositionsController extends ClubhouseController {
  @tracked people;
  @tracked committed = false;
  @tracked positionId = null;
  @tracked positionTitle = '';
  @tracked successCount = 0;
  @tracked errorCount = 0;
  @tracked isSubmitting = false;

  grantRevokeOptions = [
    ['Grant Position', true],
    ['Revoke Position', false]
  ];

  get errorCount() {
    if (!this.people) {
      return 0;
    }

    return this.people.filter((p) => p.errors).length;
  }

  get successCount() {
    if (!this.people) {
      return 0;
    }

    return this.people.filter((p) => p.errors).length;
  }

  get positionOptions() {
    const options = this.positions.map((p) => [p.title, p.id]);
    options.unshift(['Select a position', null]);
    return options;
  }

  @action
  _execute(commit) {
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

    this.ajax.post('position/bulk-grant-revoke', {data}).then(({people}) => {
      this.house.scrollToTop();
      this.people = people;
      if (commit && !this.errorCount) {
        this.committed = true;
        this.bulkForm.callsigns = '';
      }

      this.errorCount = people.filter((p) => p.errors).length;
      this.successCount = people.filter((p) => p.success).length;
    })
      .catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.isSubmitting = false)
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
