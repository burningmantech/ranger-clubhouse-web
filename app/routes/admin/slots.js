import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default class AdminSlotsRoute extends Route {
  queryParams = {
    year: { refreshModel: true }
  };

  model(params) {
    const year = (params.year || (new Date).getFullYear());

    return RSVP.hash({
      slots: this.store.query('slot', { year }).then((result) => { return result.toArray() }),
      positions: this.store.query('position', {}),
      year,
      yearList: this.ajax.request('slot/years').then((result) => result.years)
    });
  }

  setupController(controller, model) {
    controller.set('slot', null);
    controller.set('slots', model.slots);
    controller.set('positions', model.positions);
    controller.set('year', model.year);
    controller.set('yearList', model.yearList);
  }

}
