import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import { set } from '@ember/object';
import RSVP from 'rsvp';
import { ADMIN, EDIT_BMIDS } from 'clubhouse/constants/roles';
import { ACTIVE, INACTIVE, INACTIVE_EXTENSION, RETIRED, ALPHA, PROSPECTIVE } from 'clubhouse/constants/person_status';
import requestYear from 'clubhouse/utils/request-year';

const ALLOWED_STATUSES = [
  ACTIVE, INACTIVE, INACTIVE_EXTENSION, RETIRED, ALPHA, PROSPECTIVE
];

export default class VcBmidPrintRoute extends ClubhouseRoute {
  roleRequired = [ ADMIN, EDIT_BMIDS];
  queryParams = {
    filter: { refreshModel: true },
  };

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

    controller.set('textFilterInput', '');
    controller.set('textFilter', '');
    controller.set('textFilterError', '');
    controller._buildViewBmids();
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.setProperties({
        bmids: null, doNotPrint: null, issues: null, printed: null, submitted: null, unusualStatus: null, year: null
      });
    }
    this.store.unloadAll('bmid');
  }
}
