import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import { Role } from 'clubhouse/constants/roles';

/*
 * Top level training route "/training"
 *
 * Admins, Trainers, VC, and Mentors are allowed.
 */

export default class TrainingRoute extends ClubhouseRoute {
  beforeModel() {
    if (!this.session.user.hasRole([ Role.ADMIN, Role.TRAINER, Role.VC, Role.MENTOR, Role.ART_TRAINER])) {
      this.toast.error("Sorry, you need to be a trainer, mentor, VC or Admin to access this.");
      this.transitionTo('me.homepage');
    }
  }

  model(params) {
    const positionId = (params.position_id == 'dirt' ? 13 : params.position_id)
    return this.ajax.request(`training/${positionId}`)
          .then((results) => results)
          .catch((response) => this.house.handleErrorResponse(response));
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    controller.set('training', model);
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
