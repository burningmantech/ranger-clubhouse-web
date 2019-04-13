import Route from '@ember/routing/route';
import { set } from '@ember/object';
import { Role } from 'clubhouse/constants/roles';
import requestYear from 'clubhouse/utils/request-year';

import RSVP from 'rsvp';

const ALLOWED_STATUSES = [
  'active', 'inactive', 'inactive extension', 'retired', 'alpha', 'prospective'
];

export default class VcBmidPrintRoute extends Route {
  queryParams = {
    year: { refreshModel: true },
    filter: { refreshModel: true },
  };

  beforeModel() {
    this.house.roleCheck([ Role.ADMIN, Role.EDIT_BMIDS ]);
  }

  model(params) {
    const year = requestYear(params);
    const filter = params.filter || 'special';

    return RSVP.hash({
      year,
      filter,
      bmids: this.ajax.request(`bmid/manage`, { data: { year, filter }}).then((result) => result.bmids),
    });
  }

  setupController(controller, model) {
    const bmids = [], doNotPrint = [], issues = [],
        printed = [], submitted = [], unusualStatus = [];

    controller.set('year', model.year);
    controller.set('filter', model.filter);
    controller.set('batchForm', {});

    this.store.unloadAll('bmid');

    model.bmids.forEach((bmid) =>{
      switch (bmid.status) {
        case 'do_not_print':
          doNotPrint.push(bmid);
          return;

        case 'issues':
          issues.push(bmid);
          return;

        case 'printed':
          printed.push(bmid);
          return;

        case 'submitted':
          submitted.push(bmid);
          return;
      }

      if (!ALLOWED_STATUSES.includes(bmid.person.status)) {
        unusualStatus.push(bmid);
        return;
      }

      set(bmid, 'selected', 1)
      bmids.push(this.store.createRecord('bmid', bmid));
    });

    controller.setProperties({
      bmids, doNotPrint, issues, printed, submitted, unusualStatus
    });

    controller.set('totalBmids', model.bmids.length);
  }

  resetController(controller) {
    controller.setProperties({
      bmids: null, doNotPrint: null, issues: null, printed: null, submitted: null, unusualStatus: null
    });
    this.store.unloadAll('bmid');
  }
}
