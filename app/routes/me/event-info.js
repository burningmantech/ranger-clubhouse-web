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
      personCertifications: this.ajax.request('person-certification', {data: {person_id}}).then(({person_certification}) => person_certification),
      personMembership: this.ajax.request(`person/${person_id}/membership`).then(({membership}) => membership),
    });
  }

  setupController(controller, model) {
    const { personMembership} = model;
    controller.set('person', this.modelFor('me'));
    controller.setProperties(model);
    controller.set('eventInfo', model.eventInfo);
    controller.set('personMembership', personMembership);
    controller.set('personEvent', model.personEvent);
    controller.set('year', this.year);

    const teamsById = {}, generalPositions = [];
    personMembership.teams.forEach((t) => teamsById[t.id] = t);

    personMembership.positions.forEach((p) => {
      if (!p.team_id || !teamsById[p.team_id]) {
        generalPositions.push(p);
      } else {
        (teamsById[p.team_id].positions ??= []).push(p);
      }
    });
    controller.set('generalPositions', generalPositions);
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
