import Route from '@ember/routing/route';
import requestYear from 'clubhouse/utils/request-year';
import RSVP from 'rsvp';

export default class AdminSlotsRoute extends Route {
  queryParams = {
    year: { refreshModel: true }
  };

  model(params) {
    const year = requestYear(params);

    this.store.unloadAll('slot');
    this.store.unloadAll('position');

    return RSVP.hash({
      slots: this.store.query('slot', { year }),
      positions: this.store.query('position', {}),
      year,
      yearList: this.ajax.request('slot/years').then((result) => result.years),
      eventDate: this.ajax.request('event-dates/year', { data: { year }}).then((result) => result.event_date)
    });
  }

  setupController(controller, model) {
    controller.set('slot', null);
    controller.setProperties(model)
    controller.set('showingGroups', {});
    controller.set('dayFilter', 'all');
    controller.set('activeFilter', 'all');
  }
}
