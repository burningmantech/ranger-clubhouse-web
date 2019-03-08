import { inject as service } from "@ember/service";
import SessionService from "ember-simple-auth/services/session";
import User from "clubhouse/models/user";

export default SessionService.extend({
  store: service(),

  user: null,

  async loadUser() {
    if (!this.isAuthenticated) {
      return;
    }
    const person_id = this.get('session.authenticated.person_id');
    const person = await this.store.find("person", person_id);
    await person.loadUserInfo();

    /*
     * A separate record is used to handle the login user to avoid
     * some quirks with using a person Ember Data record.
     */

    const user = User.create({
      id: person.id,
      callsign: person.callsign,
      callsign_approved: person.callsign_approved,
      roles: person.roles,
      status: person.status,
      teacher: person.teacher,
      unread_message_count: person.unread_message_count,
      bpguid: person.bpguid,    // PNV or Actives must have a BPGUID to sign up.
    });

    this.set('user', user);
  }
});
