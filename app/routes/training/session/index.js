import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class TrainingSessionIndexRoute extends ClubhouseRoute {
  setupController(controller) {
    const session = this.modelFor('training/session');
    controller.set('training', this.modelFor('training'));
    // set slot, students, and trainers
    controller.setProperties(session);
    controller.set('showEmails', false);
    controller.set('searchForm', null);
    controller.set('editStudent', null);

    let havePrimaryTrainers = false;
    session.trainers.forEach((group) => {
      if (group.is_primary_trainer && group.trainers.length > 0) {
        havePrimaryTrainers  = true;
      }
    });
    controller.set('havePrimaryTrainers', havePrimaryTrainers);
  }
}
