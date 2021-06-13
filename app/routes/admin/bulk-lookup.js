import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {ADMIN} from 'clubhouse/constants/roles';
import EmberObject from '@ember/object';

export default class AdminBulkLookupRoute extends ClubhouseRoute {
  roleRequired = ADMIN;

  setupController(controller) {
    controller.setProperties({
      bulkForm: EmberObject.create({lines: ''}),
      people: [],
      peopleFound: [],
      peopleNotFound: [],
    });
  }
}
