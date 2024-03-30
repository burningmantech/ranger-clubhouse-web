import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class PersonIndexRoute extends ClubhouseRoute {
  async model() {
    const person = this.modelFor('person');
    const personId = person.id;

    const data = {
      eventInfo: person.eventInfo
    };


    data.grantedRoles = await this.ajax.request(`person/${personId}/roles`, {data: {include_memberships: 1}});
    data.personMembership = await this.ajax.request(`person/${personId}/membership`).then(({membership}) => membership);
    data.photo = await this.ajax.request(`person/${personId}/photo`).then(({photo}) => photo);
    data.roles = await this.ajax.request('role').then(({role}) => role);
    data.teams = await this.ajax.request('team', {data: {can_manage: 1}}).then(({team}) => team);
    data.personFkas = await this.store.query('person-fka', { person_id: personId });

    return data;
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
