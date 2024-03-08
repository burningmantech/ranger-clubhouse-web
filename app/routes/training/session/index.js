import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class TrainingSessionIndexRoute extends ClubhouseRoute {
  setupController(controller) {
    const session = this.modelFor('training/session');
    controller.training = this.modelFor('training');
    // set slot, students, and trainers
    controller.setProperties(session);
    controller.showEmails = false;
    controller.searchForm = null;
    controller.editStudent = null;
    controller.year = session.slot.begins_year;

    let havePrimaryTrainers = false;
    session.trainers.forEach((group) => {
      if (group.is_primary_trainer && group.trainers.length > 0) {
        havePrimaryTrainers  = true;
      }
    });
    controller.havePrimaryTrainers = havePrimaryTrainers;
  }
}
