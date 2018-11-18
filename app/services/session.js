import { inject as service } from '@ember/service';
import SessionService from 'ember-simple-auth/services/session';
import User from 'clubhouse/models/user';
import RSVP from 'rsvp';

export default SessionService.extend({
  store: service(),

  user: null,

  async loadUser() {
    if (!this.isAuthenticated) {
      return;
    }
    const person_id = this.get('session.authenticated.person_id')
    const person = await this.store.find('person', person_id);
    await person.loadRangerInfo();

    const user = User.create({
      id: person.id,
      callsign:  person.callsign,
      callsign_approved: person.callsign_approved,
      roles: person.roles,
      status: person.status,
      teacher: person.teacher,
      unread_message_count: person.unread_message_count,
    })
    this.set('user', user);
  }
});
