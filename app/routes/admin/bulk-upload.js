import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import { ADMIN, EDIT_SLOTS } from 'clubhouse/constants/roles';

export default class AdminBulkUploadRoute extends ClubhouseRoute {
  roleRequired = [ADMIN, EDIT_SLOTS];

  setupController(controller) {
    super.setupController(...arguments);

    controller.setProperties({
      uploadAction: null,
      commit: false,
      results: null,
      records: '',
      resultsCommitted: false,
      resultSuccesses: [],
      resultFailures: [],
      resultWarnings: []
    });
  }
}
