import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import RSVP from 'rsvp';
import requestYear from 'clubhouse/utils/request-year';


export default class PersonAssetsRoute extends ClubhouseRoute {
  queryParams = {
    year: {refreshModel: true}
  };

  model(params) {
    const person_id = this.modelFor('person').id;
    const year = requestYear(params);

    // Reload only the year-scoped asset-person collection; let asset-attachment
    // (a static, year-independent reference list) serve from cache.
    return RSVP.hash({
      year,
      assets: this.store.query('asset-person', {person_id, year}, {reload: true}),
      attachments: this.store.findAll('asset-attachment'),
      eventInfo: this.ajax.request(`person/${person_id}/event-info`, {data: {year}})
        .then((result) => result.event_info),
      personEvent: this.store.findRecord('person-event', `${person_id}-${year}`, {backgroundReload: true}),
    });
  }

  setupController(controller, model) {
    super.setupController(...arguments);

    controller.set('person', this.modelFor('person'));
    controller.set('year', model.year);
    controller.setProperties(model);
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
