import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {ADMIN, INTAKE, TRAINER, VC, MENTOR, SURVEY_MANAGEMENT, ART_TRAINER} from 'clubhouse/constants/roles';
import {TRAINING} from "clubhouse/constants/positions";

/*
 * Top level training route "/training"
 *
 * Admins, Trainers, VC, and Mentors are allowed.
 */

export default class TrainingRoute extends ClubhouseRoute {
  roleRequired = [ADMIN, TRAINER, VC, MENTOR, ART_TRAINER];

  model({position_id}) {
    const positionId = (position_id === 'dirt' ? TRAINING : position_id);
    return this.ajax.request(`training/${positionId}`);
  }

  setupController(controller, model) {
    controller.set('training', model);
    controller.set('hasIntake', this.session.hasRole(INTAKE));
    controller.set('canManageSurveys', this.session.hasRole(SURVEY_MANAGEMENT));
    controller.set('showOnlineCourseProgress', (model.id === TRAINING && this.session.hasTrueRole(TRAINER)));
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
