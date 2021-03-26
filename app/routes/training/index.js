import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import requestYear from 'clubhouse/utils/request-year';

export default class TrainingIndexRoute extends ClubhouseRoute {
  queryParams = {
    year: {refreshModel: true}
  };

  model(params) {
    const training = this.modelFor('training');
    const year = requestYear(params);

    this.year = year;
    return this.ajax.request('training-session/sessions', {
      data: {year, training_id: training.id}
    });
  }

  setupController(controller, model) {
    const training = this.modelFor('training');
    super.setupController(...arguments);
    controller.set('training', training);
    controller.set('year', this.year);

    const trainingSessions = model.sessions;
    trainingSessions.forEach((session) => {
      session.havePrimaryTrainers = false;
      session.trainers.forEach((group) => {
        // Is this trainer group a bunch of primary trainers (Trainer, Uber Trainer, any ART trainer, but NOT associate trainers)
        if (group.is_primary_trainer && group.trainers.length > 0) {
          session.havePrimaryTrainers = true;
        }
      });
    });

    controller.set('trainingSessions', trainingSessions);
  }

  // Don't allow the year parameter to bleed over to other routes.
  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
