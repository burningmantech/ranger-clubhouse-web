import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {ADMIN} from 'clubhouse/constants/roles';

export default class AdminBulkPositionsRoute extends ClubhouseRoute {
  roleRequired = ADMIN;

  model() {
    return this.ajax.request('position').then(({position}) => position);
  }

  setupController(controller, model) {
    controller.set('isSubmitting', false);
    controller.setProperties({
      positions: model,
      committed: false,
      granted: false,
      people: null,
      bulkForm: {callsigns: '', grant: false, positionId: null},
      errorCount: 0,
      successCount: 0
    });

    controller.positionsById = model.reduce((hash, p) => {
      hash[p.id] = p;
      return hash;
    }, {});
  }
}
