import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import { TECH_NINJA} from 'clubhouse/constants/roles';
import currentYear from 'clubhouse/utils/current-year';

export default class AdminTimesheetSlotRepairRoute extends ClubhouseRoute {
  roleRequired = TECH_NINJA;

  setupController(controller) {
    controller.set('hasResults', false);
    controller.set('year', currentYear());
    controller.set('entries', []);
  }
}
