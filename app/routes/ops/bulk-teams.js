import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {MANAGE} from 'clubhouse/constants/roles';
import _ from 'lodash';

export default class OpsBulkTeamsRoute extends ClubhouseRoute {
  roleRequired = MANAGE;

  model() {
    return this.ajax.request('team', { data: { can_manage: 1 }});
  }

  setupController(controller, {team}) {
    controller.isSubmitting = false;
    controller.setProperties({
      teams: team.filter((t) => t.can_manage),
      committed: false,
      granted: false,
      people: null,
      bulkForm: {callsigns: '', grant: false, teamId: null},
      errorCount: 0,
      successCount: 0
    });

    controller.teamsById = _.keyBy(team, 'id');
  }
}
