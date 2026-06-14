import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import requestYear from 'clubhouse/utils/request-year';


export default class PersonAssetsRoute extends ClubhouseRoute {
  queryParams = {
    year: {refreshModel: true}
  };

  async model(params) {
    const person_id = this.modelFor('person').id;
    const year = requestYear(params);

    // Reload only the year-scoped asset-person collection; let asset-attachment
    // (a static, year-independent reference list) serve from cache.
    return {
      year,
      assets: await this.store.query('asset-person', {person_id, year}, {reload: true}),
      attachments: await this.store.findAll('asset-attachment'),
      eventInfo: (await this.ajax.request(`person/${person_id}/event-info`, {data: {year}})).event_info,
      personEvent: await this.store.findRecord('person-event', `${person_id}-${year}`, {backgroundReload: true}),
    };
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
