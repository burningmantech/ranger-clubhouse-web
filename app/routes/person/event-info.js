import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import requestYear from 'clubhouse/utils/request-year';
import RSVP from 'rsvp';

export default class PersonEventInfoRoute extends ClubhouseRoute {
  queryParams = {
    year: { refreshModel: true }
  };

  model(params) {
    const year = requestYear(params);
    const personId = this.modelFor('person').id;

    this.year = year;

    return RSVP.hash({
      eventInfo: this.ajax.request(`person/${personId}/event-info`, { data: { year } })
                  .then((result) => result.event_info),
      personEvent: this.store.findRecord('person-event', `${personId}-${year}`, { reload: true }),
    });
  }
  setupController(controller, model) {
    controller.set('year', this.year);
    controller.set('person', this.modelFor('person'));
    controller.set('eventInfo', model.eventInfo);
    controller.set('personEvent', model.personEvent);
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
