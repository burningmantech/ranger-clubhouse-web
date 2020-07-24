import Route from '@ember/routing/route';
import RSVP from 'rsvp';
import requestYear from 'clubhouse/utils/request-year';


export default class PersonAssetsRoute extends Route {
  queryParams = {
    year: {refreshModel: true}
  };

  model(params) {
    const person_id = this.modelFor('person').id;
    const year = requestYear(params);

    this.store.unloadAll('asset-person');
    this.store.unloadAll('asset-attachment');
    this.year = year;

    return RSVP.hash({
      assets: this.store.query('asset-person', {person_id, year}),
      attachments: this.store.findAll('asset-attachment'),
      eventInfo: this.ajax.request(`person/${person_id}/event-info`, {data: {year}})
        .then((result) => result.event_info),
      personEvent: this.store.findRecord('person-event', `${person_id}-${year}`, {reload: true}),
    });
  }

  setupController(controller, model) {
    super.setupController(...arguments);

    controller.set('person', this.modelFor('person'));
    controller.set('year', this.year);
    controller.setProperties(model);
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
