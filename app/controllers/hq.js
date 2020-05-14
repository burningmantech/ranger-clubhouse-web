import Controller from '@ember/controller';

export default class HqController extends Controller {
  get allowedCheckIn() {
    const status = this.person.status;

    switch (status) {
      case 'active':
      case 'alpha':
      case 'inactive extension': // might be cheetah
      case 'inactive': // might be cheetah
      case 'non ranger':
      case 'prospective':
      case 'retired': // might be cheetah
        return true;
    }
    return false;
  }

}
