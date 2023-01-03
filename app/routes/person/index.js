import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import RSVP from 'rsvp';

export default class PersonIndexRoute extends ClubhouseRoute {
  model() {
    const person = this.modelFor('person');
    const personId = person.id;

    return RSVP.hash({
      eventInfo: person.eventInfo,
      grantedRoles: this.ajax.request(`person/${personId}/roles`, {data: {include_memberships: 1}}),
      personMembership: this.ajax.request(`person/${person.id}/membership`).then(({membership}) => membership),
      photo: this.ajax.request(`person/${person.id}/photo`).then(({photo}) => photo),
      roles: this.ajax.request('role').then(({role}) => role),
      teams: this.ajax.request('team', { data: { can_manage: 1 }}).then(({team}) => team)
    });
  }

  setupController(controller, model) {
    controller.setProperties(model);
    controller.setProperties({
      person: this.modelFor('person'),
      showUploadDialog: false,
      showEditNote: false,
      showConfirmNoteOrMessage: false,
    });
  }
}
