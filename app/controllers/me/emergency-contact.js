import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class MeEmergencyContactController extends Controller {
  @action
  cancel() {
    this.toast.warning('You have cancelled editing your emergency contact info. No changes were saved.');
    this.transitionToRoute('me.overview');
  }
}
