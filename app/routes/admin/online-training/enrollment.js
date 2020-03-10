import Route from '@ember/routing/route';

export default class AdminOnlineTrainingEnrollmentRoute extends Route {
  model() {
    return this.ajax.request('online-training/enrollment');
  }
}
