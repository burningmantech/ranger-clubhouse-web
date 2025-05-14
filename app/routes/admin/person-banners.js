import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {ADMIN} from 'clubhouse/constants/roles';

export default class AdminPersonBannerRoute extends ClubhouseRoute {
  roleRequired = ADMIN;

  model() {
    return this.store.query(`person-banner`, {include_person: 1});
  }

  setupController(controller, model) {
    controller.banners = model;
  }
}
