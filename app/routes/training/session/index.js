import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class TrainingSessionIndexRoute extends ClubhouseRoute {
  setupController(controller) {
    const session = this.modelFor('training/session');

    controller.training = this.modelFor('training');
    controller.slot = session.slot;
    controller.students = session.students;
    controller.trainers = session.trainers;
    controller.year = session.slot.begins_year;

    // The controller is a singleton; reset all transient dialog/submit state so
    // nothing carries over when re-entering for a different session (slot_id).
    controller.showEmails = false;
    controller.isSubmitting = false;
    controller.editStudent = null;
    controller.editNote = null;
    controller.studentForm = null;
    controller.addPersonForm = null;
    controller.foundPeople = null;
    controller.noSearchMatch = null;
    controller.addingTrainer = false;
    controller.addTrainerOptions = null;
    controller.addTrainerSlotId = null;
    controller.graduateTraining = null;
    controller.showWorkHistoryPerson = null;
  }
}
