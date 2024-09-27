import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class OpsSurveyRoute extends ClubhouseRoute {
  //roleRequired = [ ADMIN, SURVEY_MANAGEMENT];

  beforeModel() {
    super.beforeModel();

    if (this.session.hasSurveyManagement) {
      return true;

    }
    this.toast.error('You are not authorized for that action');
    this.router.transitionTo('me.homepage');
  }
}
