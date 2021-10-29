import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class MeMotorpoolPolicyRoute extends ClubhouseRoute {
  beforeModel() {
    this.router.transitionTo('me.agreements.index');
  }
}
