import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class AdminOnlineTrainingEnrollmentRoute extends ClubhouseRoute {
  model() {
    return this.ajax.request('online-training/enrollment');
  }
}
