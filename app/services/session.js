import { inject as service } from "@ember/service";
import SessionService from "ember-simple-auth/services/session";
import User from "clubhouse/models/user";

export default SessionService.extend({
  store: service(),

  user: null,

  loadUser() {
    if (!this.isAuthenticated) {
      return Promise.resolve();
    }

    const person_id = this.get('session.authenticated.person_id');

    return this.store.findRecord('person', person_id, { reload: true })
    .then((person) => {
      return person.loadUserInfo().then(() => {
        const user = User.create({
          id: person.id,
          callsign: person.callsign,
          callsign_approved: person.callsign_approved,
          roles: person.roles,
          status: person.status,
          teacher: person.teacher,
          has_hq_window: person.has_hq_window,
          unread_message_count: person.unread_message_count,
          bpguid: person.bpguid,    // PNV or Actives must have a BPGUID to sign up.
        });

        this.set('user', user);
      });
    });
  }
});
