import { authenticateSession } from 'ember-simple-auth/test-support';

export function authenticateUser(personId){
  return authenticateSession({
      person_id: personId,
  });
}
