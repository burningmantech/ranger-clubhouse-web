import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class ReportsCertificationsController extends ClubhouseRoute {
    model() {
      return this.ajax.request('certification');
    }

    setupController(controller, model) {
      controller.set('certifications', model.certification);
      controller.set('certificationsForm', {
        credentialIds: []
      });
      controller.set('people', []);
      controller.set('isSubmitting', false);
      controller.set('haveResults', false);
    }
}
