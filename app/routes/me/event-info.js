import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import RSVP from 'rsvp';
import requestYear from 'clubhouse/utils/request-year';

export default class MeRangerInfoRoute extends ClubhouseRoute {
  queryParams = {
    year: {refreshModel: true}
  };

  model(params) {
    const person_id = this.session.userId;
    const year = requestYear(params);

    this.year = year;
    return RSVP.hash({
      eventInfo: this.ajax.request(`person/${person_id}/event-info`, {data: {year}}).then(({event_info}) => event_info),
      personEvent: this.store.findRecord('person-event', `${person_id}-${year}`, {reload: true}),
      personPositions: this.ajax.request(`person/${person_id}/positions`).then(({positions}) => positions),
      personCertifications: this.ajax.request('person-certification', {data: {person_id}}).then(({person_certification}) => person_certification)
    });
  }

  setupController(controller, model) {
    controller.set('person', this.modelFor('me'));
    controller.setProperties(model);
    controller.set('year', this.year);
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
