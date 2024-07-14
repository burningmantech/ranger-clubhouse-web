import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {set} from '@ember/object';
import RSVP from 'rsvp';
import {ADMIN, EDIT_BMIDS} from 'clubhouse/constants/roles';
import {
  ACTIVE,
  ALPHA,
  INACTIVE,
  INACTIVE_EXTENSION,
  NON_RANGER,
  PROSPECTIVE,
  RETIRED,
} from 'clubhouse/constants/person_status';
import requestYear from 'clubhouse/utils/request-year';
import {DO_NOT_PRINT, ISSUES, SUBMITTED} from "clubhouse/models/bmid";

const ALLOWED_STATUSES = [
  ACTIVE,
  ALPHA,
  INACTIVE,
  INACTIVE_EXTENSION,
  NON_RANGER,
  PROSPECTIVE,
  RETIRED,
];

export default class VcBmidPrintRoute extends ClubhouseRoute {
  roleRequired = [ADMIN, EDIT_BMIDS];
  queryParams = {
    filter: {refreshModel: true},
  };

  model(params) {
    const year = requestYear(params);
    const filter = params.filter || 'special';

    return RSVP.hash({
      year,
      filter,
      bmids: this.ajax.request(`bmid/manage`, {data: {year, filter}}).then((result) => result.bmids),
      exportList: this.ajax.request('bmid/exports', {data: {year}}).then((result) => result.exports)
    });
  }

  setupController(controller, model) {
    const bmids = [], doNotPrint = [], issues = [],
      printed = [], submitted = [], unusualStatus = [], noPhoto = [], notQualifiedToPrint = [];

    controller.set('year', model.year);
    controller.set('filter', model.filter);
    controller.set('exportList', model.exportList);
    controller.set('batchForm', {});

    this.store.unloadAll('bmid');

    model.bmids.forEach((bmid) => {
      bmid = bmid.id ? this.house.pushPayload('bmid', bmid) : this.store.createRecord('bmid', bmid);
      switch (bmid.status) {
        case DO_NOT_PRINT:
          doNotPrint.push(bmid);
          return;

        case ISSUES:
          issues.push(bmid);
          return;

        case 'printed':
          printed.push(bmid);
          return;

        case SUBMITTED:
          submitted.push(bmid);
          return;
      }


      if (!ALLOWED_STATUSES.includes(bmid.person.status)) {
        unusualStatus.push(bmid);
        return;
      }

      if (bmid.has_approved_photo && !bmid.notQualifiedToPrint) {
        set(bmid, 'selected', 1);
      } else if (!bmid.has_approved_photo) {
        noPhoto.push(bmid);
      } else {
        notQualifiedToPrint.push(bmid);
      }
      bmids.push(bmid);
    });

    controller.setProperties({
      bmids, doNotPrint, issues, printed, submitted, unusualStatus, noPhoto, notQualifiedToPrint
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
