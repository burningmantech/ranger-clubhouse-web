import Route from '@ember/routing/route';
import MeRouteMixin from 'clubhouse/mixins/route/me';
import RSVP from 'rsvp';
import requestYear from 'clubhouse/utils/request-year';

export default class MeRangerInfoRoute extends Route.extend(MeRouteMixin) {
  queryParams = {
    year: { refreshModel: true }
  };

  model(params) {
    const person_id = this.session.userId;
    const year = requestYear(params);

    this.year = year;
    return RSVP.hash({
      eventInfo: this.ajax.request(`person/${person_id}/event-info`, { data: { year } })
                .then((result) => { return result.event_info; }),
      personEvent: this.store.findRecord('person-event', `${person_id}-${year}`, { reload: true}),
      personPositions: this.ajax.request(`person/${person_id}/positions`).then((results) => results.positions),
    });
  }

  setupController(controller, model) {
    controller.set('person', this.modelFor('me'));
    controller.set('eventInfo', model.eventInfo);
    controller.set('personPositions', model.personPositions);
    controller.set('personEvent', model.personEvent);
    controller.set('year', this.year);
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
