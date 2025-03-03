import ClubhouseController from "clubhouse/controllers/clubhouse-controller";
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {htmlSafe} from '@ember/template';


export default class VcApplicationImportController extends ClubhouseController {
  @tracked isSubmitting;
  @tracked hasFailed;
  @tracked newApplications;
  @tracked existingApplications;
  @tracked queryFailures;
  @tracked createFailures;
  @tracked apiError;
  @tracked commited;
  @tracked hasResults;

  @action
  previewApplications() {
    this._submit(false);
  }

  @action
  importApplications() {
    this.modal.confirm(
      `Confirm Import`,
      htmlSafe(`You are about to <b class="text-danger">IMPORT</b> the current Salesforce applications from View 1.`),
      () => this._submit(true)
    );
  }

  @action
  async _submit(commit) {
    try {
      this.isSubmitting = true;
      this.hasFailed = false;
      this.hasResults = false;
      this.apiError = null;
      const result = await this.ajax.post(`prospective-application/import`, {data: {commit: commit ? 1 : 0}});
      if (result.status === 'success') {
        this.apiError = result.api_error;
        this.newApplications = result.new;
        this.existingApplications = result.existing;
        this.queryFailures = result.query_failures;
        this.createFailures = result.create_failures;
        this.hasResults = true;
        this.commited = commit;
      } else {
        this.modal.info('Serious processing error occurred', `The following error occurred:<br>Message: ${result.message}`);
      }
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }
}
