import Route from '@ember/routing/route';
import { Role } from 'clubhouse/constants/roles';

export default class AdminSurveyRoute extends Route {
  queryParmas = {
    year: { refreshModel: true }
  };

  beforeModel() {
    super.beforeModel(...arguments);
    this.house.roleCheck(Role.ADMIN);
  }
}
