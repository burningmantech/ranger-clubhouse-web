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

    this.year = year;
    return RSVP.hash({
      credits: this.store.query('position-credit', { year }),
      positions: this.store.query('position', {}),
      year,
    });
  }

  setupController(controller, model) {
    controller.set('year', this.year);
    controller.set('entry', null);
    controller.set('positionFilter', 'all');
    controller.set('dayFilter', 'all');
    controller.setProperties(model)
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
