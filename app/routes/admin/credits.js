import Route from '@ember/routing/route';
import requestYear from 'clubhouse/utils/request-year';
import RSVP from 'rsvp';

export default class AdminCreditsRoute extends Route {
  queryParams = {
    year: { refreshModel: true }
  };

  model(params) {
    const year = requestYear(params);

    this.store.unloadAll('position-credit');
    this.store.unloadAll('position');

    return RSVP.hash({
      credits: this.store.query('position-credit', { year }).then((result) => result.toArray()),
      positions: this.store.query('position', {}),
      year,
    });
  }

  setupController(controller, model) {
    controller.set('entry', null);
    controller.setProperties(model)
  }
}
