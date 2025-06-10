import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import requestYear from 'clubhouse/utils/request-year';

export default class OpsSlotsRoute extends ClubhouseRoute {
  queryParams = {
    year: {refreshModel: true}
  };

  async model(params) {
    const year = requestYear(params);

    this.store.unloadAll('slot');
    this.store.unloadAll('position');

    return {
      slots: await this.store.query('slot', {year}),
      positions: await this.store.query('position', {}),
      year,
      yearList: await this.ajax.request('slot/years').then((result) => result.years),
      eventDate: await this.ajax.request('event-dates/year', {data: {year}}).then((result) => result.event_date)
    }
  }

  setupController(controller, model) {
    controller.setProperties(model)
    controller.slot = null;
    controller.dayFilter = 'all';
    controller.activeFilter = 'all';
    controller.filterByDescription = '';
    controller.positionsOpened = {};
    controller.positionsById = model.positions.reduce((hash, row) => {
      hash[+row.id] = row;
      return hash
    }, {})
  }
}
