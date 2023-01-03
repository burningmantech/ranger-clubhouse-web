import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {ADMIN, EDIT_SLOTS} from 'clubhouse/constants/roles';
import Selectable from 'clubhouse/utils/selectable';

export default class AdminBulkUploadRoute extends ClubhouseRoute {
  roleRequired = [ADMIN, EDIT_SLOTS];

  model() {
    return this.ajax.request('bulk-upload/actions');
  }

  setupController(controller, model) {
    controller.set('actionGroups',
      model.actions.map((uploadGroup) => ({
        label: uploadGroup.label,
        options: uploadGroup.options.map((opt) => new Selectable({
          id: opt.id,
          label: opt.label,
          help: opt.help
        }))
      }))
    );

    controller.setProperties({
      uploadAction: null,
      actionLabel: '',
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
