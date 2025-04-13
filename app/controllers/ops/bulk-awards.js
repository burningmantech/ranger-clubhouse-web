import ClubhouseController from "clubhouse/controllers/clubhouse-controller";
import {action} from '@ember/object';
import {cached, tracked} from '@glimmer/tracking';
import {isEmpty} from 'lodash';
import {REBUILD_INFO} from "clubhouse/models/person-award";

export default class OpsBulkAwardsController extends ClubhouseController {
  @tracked records;
  @tracked callsignList;
  @tracked isSubmitting = false;
  @tracked didCommit = false;

  @action
  verifyAction() {
    if (isEmpty(this.callsignList)) {
      this.modal.info('', 'No callsigns entered');
      return;
    }

    this._submitCallsigns(false);
  }

  @action
  commitAction() {
    this._submitCallsigns(true);
  }

  @cached
  get resultSuccesses() {
    return this.records.filter((r) => isEmpty(r.error));
  }

  @cached
  get resultFailures() {
    return this.records.filter((r) => !isEmpty(r.error));
  }

  async _submitCallsigns(commit) {
    this.records = [];
    this.isSubmitting = true;
    try {
      const {records} = await this.ajax.post('person-award/bulk-grant', {
        data: {
          lines: this.callsignList,
          commit: commit ? 1 : 0
        }
      });
      this.records = records;
      this.didCommit = commit;
    } catch (e) {
      this.house.handleErrorResponse(e);
    } finally {
      this.isSubmitting = false;
    }
  }

  @action
  rebuildAwards() {
    this.modal.confirm('Rebuild All Awards',
      `<p>Normally, this operation is run automatically every Sunday at 0400 Pacific. ` +
      `This is intended to issue, and/or revoke, awards immediately after a change in a team's or position's award eligibility.</p>` +
      `<p><b>Rebuilding awards for the entire site may take a while.</b></p>` + REBUILD_INFO,
      async () => {
        try {
          this.isSubmitting = true;
          await this.ajax.post('person-award/rebuild-all-awards');
          this.toast.success('All awards were rebuilt successfully.');
        } catch (e) {
          this.house.handleErrorResponse(e);
        } finally {
          this.isSubmitting = false;
        }
      });
  }
}
