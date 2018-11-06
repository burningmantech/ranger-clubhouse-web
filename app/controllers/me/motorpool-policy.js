import Controller from '@ember/controller';
import { action } from '@ember-decorators/object';

export default class MotorpoolPolicyController extends Controller {

 @action
  agreeAction() {
    this.person.set('vehicle_paperwork', true);

    this.person.save().then(() => {
      this.toast.success('Agreement acknowledge.');
    }).catch((response) => { this.house.handleErrorResponse(response)});
  }
}
