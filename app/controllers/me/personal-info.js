import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import PersonInfoValidations from 'clubhouse/validations/person-info';
import {pronounOptions} from 'clubhouse/constants/pronouns';

import {
  ShortSleeve as ShortSleeveOptions,
  LongSleeve as LongSleeveOptions
} from 'clubhouse/constants/shirts';

export default class MePersonalInfoEditController extends ClubhouseController {
  @tracked showUpdateMailingListsDialog = false;

  personInfoValidations = PersonInfoValidations;
  shortSleeveOptions = ShortSleeveOptions;
  longSleeveOptions = LongSleeveOptions;
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
        if (emailChanged) {
          this.showUpdateMailingListsDialog = true;
          this.oldEmail = oldEmail;
        } else {
          this.transitionToRoute('me.homepage');
        }
      })
  }

  @action
  onCancel() {
    this.toast.warning('Editing your personal information was cancelled. No changes were saved.');
    this.transitionToRoute('me.homepage');
  }

  @action
  cancelMailingListDialog() {
    this.showUpdateMailingListsDialog = false;
    this.toast.warning('No request was sent to update the mailing lists.');
    this.transitionToRoute('me.homepage');
  }

  @action
  sendMailingListUpdateRequest() {
    this.ajax.request(`contact/${this.person.id}/update-mailing-lists`,
      {method: 'POST', data: {old_email: this.oldEmail}})
      .then(() => {
        this.showUpdateMailingListsDialog = false;
        this.toast.success('Request to update mailing lists successfully sent.');
        this.transitionToRoute('me.homepage');
      }).catch((response) => this.house.handleErrorResponse(response));
  }
}
