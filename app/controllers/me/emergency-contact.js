import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class MeEmergencyContactController extends Controller {
  @action
  cancel() {
    this.transitionToRoute('me.homepage');
  }
}
