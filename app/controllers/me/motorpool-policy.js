import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class MotorpoolPolicyController extends Controller {

  @action
  agreeAction() {
    this.person.set('vehicle_paperwork', true);

    this.set('isSubmitting', true);
    this.person.save().then(() => {
        this.set('hasAgreed', true);
        this.toast.success('Agreement acknowledged.');
      }).catch((response) => { this.house.handleErrorResponse(response) })
      .finally(() => this.set('isSubmitting', false));
  }
}
