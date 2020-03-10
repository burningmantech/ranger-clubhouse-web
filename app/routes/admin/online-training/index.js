import Route from '@ember/routing/route';

export default class AdminOnlineTrainingIndexRoute extends Route {
  model() {
    return this.ajax.request('online-training/config');
  }
}
