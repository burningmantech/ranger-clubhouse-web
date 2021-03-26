import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';

export default class AdminSurveyIndexController extends ClubhouseController {
  queryParams = ['year'];
  @tracked surveyEntry;
  @tracked isDuplicating = false;

  @action
  newSurveyAction() {
    this.surveyEntry = this.store.createRecord('survey', {year: this.year, type: 'training'});
  }

  @action
  deleteSurveyAction(survey) {
    this.modal.confirm('Confirm Deletion',
      'You are about to delete a survey. All questions and answers will be removed. Are you sure you want to do this?',
      () => {
        survey.destroyRecord().then(() => {
          this.surveys.update();
        }).catch((response) => this.house.handleErrorResponse(response));
      });
  }

  @action
  cancelSurveyAction() {
    this.surveyEntry = null;
  }

  @action
  saveSurveyAction() {
    const id = this.surveyEntry.id;

    this.surveyEntry = null;
    this.transitionToRoute('admin.survey.manage', id);
  }

  @action
  duplicateSurveyAction(survey) {
    const year = this.house.currentYear();

    this.modal.confirm('Duplicate Survey',
      `Are you sure you want to duplicate "${survey.title}"? The survey will be duplicated as a ${year} survey.`,
      () => {
        this.isDuplicating = true;
        this.ajax.request(`survey/${survey.id}/duplicate`, { method: 'POST' })
          .then((result) => {
            this.toast.success('Survey was successfully duplicated.');
            this.transitionToRoute('admin.survey.manage', result.survey_id);
          })
          .catch((response) => this.house.handleErrorResponse(response))
          .finally(() => this.isDuplicating = false);
      });
  }

}
