import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class MotorpoolPolicyController extends Controller {

 @action
  agreeAction() {
    this.person.set('vehicle_paperwork', true);

    this.person.save().then(() => {
      this.toast.success('Agreement acknowledged.');
    }).catch((response) => { this.house.handleErrorResponse(response)});
  }
}
