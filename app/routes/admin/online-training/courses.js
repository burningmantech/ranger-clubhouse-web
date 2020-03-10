import Route from '@ember/routing/route';

export default class AdminOnlineTrainingCoursesRoute extends Route {
  model() {
    return this.ajax.request('online-training/courses');
  }
}
