import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {
  ADMIN,
  INTAKE,
  TRAINER,
  VC,
  MENTOR,
  SURVEY_MANAGEMENT,
  ART_TRAINER,
  SURVEY_MANAGEMENT_BASE
} from 'clubhouse/constants/roles';
import {TRAINING} from "clubhouse/constants/positions";

/*
 * Top level training route "/training"
 *
 * Admins, Trainers, VC, and Mentors are allowed.
 */

export default class TrainingRoute extends ClubhouseRoute {
  model({position_id}) {
    this.checkForARTPositionTrainer(position_id, [ADMIN, TRAINER, VC, MENTOR, ART_TRAINER]);

    const positionId = (position_id === 'dirt' ? TRAINING : position_id);
    return this.ajax.request(`training/${positionId}`);
  }

  setupController(controller, model) {
    const isInPersonTraining = (+model.id === TRAINING);
    controller.set('training', model);
    controller.set('hasIntake', this.session.hasRole(INTAKE));
    controller.set('canManageSurveys', this.session.isAdmin || (isInPersonTraining && this.session.hasRole(SURVEY_MANAGEMENT)) || this.session.hasRole(SURVEY_MANAGEMENT_BASE | model.id));
    controller.set('showOnlineCourseProgress', (isInPersonTraining && this.session.hasTrueRole(TRAINER)));
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
