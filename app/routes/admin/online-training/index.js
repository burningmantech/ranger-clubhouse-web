import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class AdminOnlineTrainingIndexRoute extends ClubhouseRoute {
  model() {
    return this.ajax.request('online-training/config');
  }
}
