import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import PersonInfoValidations from 'clubhouse/validations/person-info';
import {pronounOptions} from 'clubhouse/constants/pronouns';

export default class MePersonalInfoEditController extends ClubhouseController {
  @tracked showUpdateMailingListsDialog = false;
  @tracked message;
  @tracked person;
  @tracked tshirtOptions;
  @tracked longSleeveOptions;
  @tracked shirtsById;
  @tracked isReviewing = false;

  @tracked startedReview = false;
  @tracked finishedReview = false;
  @tracked completedReview = false;

  personInfoValidations = PersonInfoValidations;
  pronounOptions = pronounOptions;

  @action
  onSubmit(model, isValid) {
    if (!isValid) {
      return;
    }

    this._savePerson(model, true);
  }

  _savePerson(model, backToHome = false, cb = null) {
    const emailChanged = model.email !== this.person.email;
    const oldEmail = this.person.email;
    this.house.saveModel(model, 'Your personal information was successfully updated.',
      () => {
        if (emailChanged && this.person.isRanger) {
          this.message = '';
          this.showUpdateMailingListsDialog = true;
          this.oldEmail = oldEmail;
        } else if (backToHome) {
          this.router.transitionTo('me.homepage');
        }
        cb?.();
      })
  }


  @action
  onCancel() {
    this.toast.warning('Editing your personal information was cancelled. No changes were saved.');
    this.router.transitionTo('me.homepage');
  }

  @action
  cancelMailingListDialog() {
    this.showUpdateMailingListsDialog = false;
    this.toast.warning('No request was sent to update the mailing lists.');
    this.router.transitionTo('me.homepage');
  }

  @action
  sendMailingListUpdateRequest() {
    this.ajax.request(`contact/${this.person.id}/update-mailing-lists`,
      {method: 'POST', data: {old_email: this.oldEmail, message: this.message}})
      .then(() => {
        this.showUpdateMailingListsDialog = false;
        this.toast.success('Request to update mailing lists successfully sent.');
        this.router.transitionTo('me.homepage');
      }).catch((response) => this.house.handleErrorResponse(response));
  }

  @action
  navigateStep(model, cb) {
    if (!model.isDirty) {
      cb();
      return;
    }

    model.validate().then(() => {
      if (!model.isInvalid) {
        model.save().then(() => this._savePerson(model, false, cb));
      }
    }).catch((response) => this.house.handleErrorResponse(response));
  }


  @action
  startReview() {
    this.isReviewing = true;
  }

  @action
  cancelReview() {
    this.isReviewing = false;
  }

  @action
  finishReview(model) {
    model.has_reviewed_pi = true;
    this._savePerson(model, false, () => {
      this.toast.success('You have successfully completed the Personal Info review. Thank you!');
      this.isReviewing = false;
      this._updateMilestone('finished');
      this.finishedReview = true;
      this.completedReview = true;
    });
  }

  /**
   * Record the pii review milestone (started or finished)
   *
   * @param {string} milestone
   * @private
   */
  _updateMilestone(milestone) {
    this.ajax.request(`person-event/${this.session.userId}/progress`, {
      method: 'POST',
      data: {milestone: `pii-${milestone}`}
    })
      .catch((response) => this.house.handleErrorResponse(response));
  }

}
