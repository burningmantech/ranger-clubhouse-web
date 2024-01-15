import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {ADMIN} from 'clubhouse/constants/roles';
import _ from 'lodash';

export default class AdminBulkTeamsRoute extends ClubhouseRoute {
  roleRequired = ADMIN;

  model() {
    return this.ajax.request('team').then(({team}) => team);
  }

  setupController(controller, model) {
    controller.isSubmitting = false;
    controller.setProperties({
      teams: model,
      committed: false,
      granted: false,
      people: null,
      bulkForm: {callsigns: '', grant: false, teamId: null},
      errorCount: 0,
      successCount: 0
    });

    controller.teamsById = _.keyBy(model, 'id');
  }
}
