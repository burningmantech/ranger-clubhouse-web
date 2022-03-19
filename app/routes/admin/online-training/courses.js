import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class AdminOnlineTrainingCoursesRoute extends ClubhouseRoute {
  model() {
    return this.ajax.request('online-training/courses');
  }

  setupController(controller, model) {
    controller.set('courses', model.courses);
  }
}
