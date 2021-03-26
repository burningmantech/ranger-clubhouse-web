import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class ReportsSpecialTeamsRoute extends ClubhouseRoute {
    model() {
      return this.ajax.request('position');
    }

    setupController(controller, model) {
      const year = this.house.currentYear();
      controller.set('positions', model.position);
      controller.set('teamsForm', {
        showInactives: false,
        startYear: year,
        endYear: year,
        positionIds: []
      });
      controller.set('people', []);
      controller.set('isSubmitting', false);
      controller.set('haveResults', false);
    }
}
