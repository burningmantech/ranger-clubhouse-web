import Route from '@ember/routing/route';
import { Role } from 'clubhouse/constants/roles';

export default class AdminBulkUploadRoute extends Route {
  beforeModel() {
    this.house.roleCheck([Role.EDIT_SLOTS, Role.ADMIN]);
  }

  setupController(controller) {
    super.setupController(...arguments);

    controller.setProperties({
      uploadAction: null,
      commit: false,
      results: null,
      records: '',
      resultsCommitted: false,
      resultSuccesses: [],
      resultFailures: []
    });
  }
}
