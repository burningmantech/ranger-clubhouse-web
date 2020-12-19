import { authenticateSession } from 'ember-simple-auth/test-support';

export function authenticateUser(personId){
  return authenticateSession({
    tokenData: {
      sub: personId,
      exp: (Math.ceil(Date.now() / 1000) + 1000),
    }
  });
}
