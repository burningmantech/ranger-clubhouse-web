import Controller from '@ember/controller';
import { computed } from '@ember/object';

export default class HqController extends Controller {
  @computed('person.status')
  get allowedCheckIn() {
    const status = this.person.status;

    switch (status) {
    case 'active':
    case 'alpha':
    case 'prospective':
    case 'inactive': // might be cheetah
    case 'retired':
    case 'non ranger':
      return true;
    }
    return false;
  }

}
