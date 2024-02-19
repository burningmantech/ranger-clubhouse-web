import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {MANAGE} from 'clubhouse/constants/roles';
import _ from 'lodash';

export default class OpsBulkPositionsRoute extends ClubhouseRoute {
  roleRequired = MANAGE;

  model() {
    return this.ajax.request('position', {data: { can_manage: 1 }});
  }

  setupController(controller, {position}) {
    controller.isSubmitting = false;
    controller.setProperties({
      positions: position.filter((p) => p.can_manage),
      committed: false,
      granted: false,
      people: null,
      bulkForm: {callsigns: '', grant: false, positionId: null},
      errorCount: 0,
      successCount: 0
    });

    controller.positionsById = _.keyBy(position, 'id');
  }
}
