import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';

export default class OpsSurveyIndexController extends ClubhouseController {
  queryParams = ['year'];

  @tracked surveyEntry;
  @tracked isDuplicating = false;
  @tracked surveys;
  @tracked positionsById;
  @tracked positionOptions;
  @tracked mentorPositionOptions;
  @tracked menteePositionOptions;

  @action
  newSurveyAction() {
    this.surveyEntry = this.store.createRecord('survey', {year: this.year, type: 'training'});
  }

  @action
  deleteSurveyAction(survey) {
    this.modal.confirm('Confirm Deletion',
      'You are about to delete a survey. All questions and answers will be removed. Are you sure you want to do this?',
      async () => {
        try {
          await survey.destroyRecord();
          this.surveys.update();
        } catch (response) {
          this.errors.handleErrorResponse(response);
        }
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
    this.router.transitionTo('ops.survey.manage', id);
  }

  @action
  duplicateSurveyAction(survey) {
    const year = this.session.currentYear();

    this.modal.confirm('Duplicate Survey',
      `Are you sure you want to duplicate "${survey.title}"? The survey will be duplicated as a ${year} survey.`,
      async () => {
        this.isDuplicating = true;
        try {
          const result = await this.ajax.request(`survey/${survey.id}/duplicate`, { method: 'POST' });
          this.toast.success('Survey was successfully duplicated.');
          this.router.transitionTo('ops.survey.manage', result.survey_id);
        } catch (response) {
          this.errors.handleErrorResponse(response);
        } finally {
          this.isDuplicating = false;
        }
      });
  }

}
