import Route from '@ember/routing/route';
import RSVP from 'rsvp';
import requestYear from 'clubhouse/utils/request-year';


export default class PersonAssetsRoute extends Route {
  queryParams = {
    year: { refreshModel: true }
  };

  model(params) {
    const personId = this.modelFor('person').id;
    const year = requestYear(params);

    return RSVP.hash({
      assets: this.store.query('asset-person', { person_id: personId, year }),
      attachments: this.store.findAll('asset-attachment'),
      year,
    });
  }

  setupController(controller, model) {
    super.setupController(...arguments);

    controller.set('person', this.modelFor('person'));
    controller.setProperties(model);
    controller.clearErrors();
    controller.set('checkoutForm.barcode', '');
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
