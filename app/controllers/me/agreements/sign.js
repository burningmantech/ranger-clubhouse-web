import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {htmlSafe} from '@ember/template';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';

const DEPT_NDA = 'dept-nda';

export default class MeAgreementsSignController extends ClubhouseController {
  @tracked didSign = false;
  @tracked isSubmitting = false;

  get bodyText() {
    return htmlSafe(this.agreement.text);
  }

  get notAvailable() {
    return this.agreement.status === 'not-available';
  }

  @action
  signDocument() {
    this.isSubmitting = true;
    this.ajax.request(`agreements/${this.session.userId}/${this.agreement.tag}/sign`, {
      method: 'POST',
      data: {signature: 1}
    }).then(() => {
      this.didSign = true;
      if (this.agreement.tag === DEPT_NDA) {
        // Signing the NDA reactivates all roles.
        this.session.loadUser();
      }
    })
      .catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.isSubmitting = false)
  }
}
