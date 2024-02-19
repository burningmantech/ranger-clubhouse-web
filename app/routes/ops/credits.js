import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import requestYear from 'clubhouse/utils/request-year';
import RSVP from 'rsvp';

export default class OpsCreditsRoute extends ClubhouseRoute {
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
    controller.setProperties(model);
    controller.set('positionsOpened', {});
    controller._buildDisplay();
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
