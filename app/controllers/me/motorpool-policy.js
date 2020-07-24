import Controller from '@ember/controller';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';

export default class MotorpoolPolicyController extends Controller {
  @tracked isSubmitting;
  @tracked hasAgreed;

  @action
  agreeAction() {
    this.personEvent.signed_motorpool_agreement = true;

    this.isSubmitting = true;
    this.personEvent.save().then(() => {
      this.hasAgreed = true;
      this.toast.success('Agreement has been successfully recorded.');
    }).catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.isSubmitting = false);
  }
}
