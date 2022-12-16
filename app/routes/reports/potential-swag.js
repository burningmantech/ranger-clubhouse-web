import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class ReportsPotentialSwagRoute extends ClubhouseRoute {
  model() {
    return this.ajax.request(`swag/potential-swag`);
  }

  setupController(controller, {people, signup_year}) {
    controller.people = people;
    controller.signupYear = signup_year;
  }
}
