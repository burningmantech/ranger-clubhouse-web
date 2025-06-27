import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import requestYear from 'clubhouse/utils/request-year';

export default class MeRangerInfoRoute extends ClubhouseRoute {
  queryParams = {
    year: {refreshModel: true}
  };

  async model(params) {
    const person_id = this.session.userId;
    const year = requestYear(params);

    this.year = year;
    return {
      eventInfo: await this.ajax.request(`person/${person_id}/event-info`, {data: {year}}).then(({event_info}) => event_info),
      personEvent: await this.store.findRecord('person-event', `${person_id}-${year}`, {reload: true}),
      personPositions: await this.ajax.request(`person/${person_id}/positions`).then(({positions}) => positions),
      personCertifications: await this.ajax.request('person-certification', {data: {person_id}}).then(({person_certification}) => person_certification),
      personMembership: await this.ajax.request(`person/${person_id}/membership`).then(({membership}) => membership),
    };
  }

  setupController(controller, model) {
    controller.person = this.modelFor('me');
    controller.eventInfo = model.eventInfo;
    controller.personMembership = model.personMembership;
    controller.personEvent = model.personEvent;
    controller.personPositions = model.personPositions;
    controller.personCertifications = model.personCertifications;
    controller.personTeams = model.personTeams;
    controller.year = this.year;
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.year = null;
    }
  }
}
