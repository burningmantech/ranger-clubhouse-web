import Controller from '@ember/controller';
import { action, set } from '@ember/object';

export default class ReportsPeopleByStatusController extends Controller {
  @action
  toggleStatus(status) {
    set(status, 'showing', !status.showing);
  }
}
