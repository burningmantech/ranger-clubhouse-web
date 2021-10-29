import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class MeRadioCheckoutRoute extends ClubhouseRoute {
  beforeModel() {
    this.router.transitionTo('me.agreements.index');
  }
}
