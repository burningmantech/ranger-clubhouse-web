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


  personInfoValidations = PersonInfoValidations;
  pronounOptions = pronounOptions;

  @action
  onSubmit(model, isValid) {
    if (!isValid) {
      return;
    }

    const emailChanged = model.email !== this.person.email;
    const oldEmail = this.person.email;
    this.person.has_reviewed_pi = true;
    this.house.saveModel(model, 'Your personal information was successfully updated.',
      () => {
        if (emailChanged && this.person.isRanger) {
          this.message = '';
          this.showUpdateMailingListsDialog = true;
          this.oldEmail = oldEmail;
        } else {
          this.router.transitionTo('me.homepage');
        }
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
}
