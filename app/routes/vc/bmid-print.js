import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {ADMIN, EDIT_BMIDS} from 'clubhouse/constants/roles';
import {
  ACTIVE,
  ALPHA,
  ECHELON,
  INACTIVE,
  INACTIVE_EXTENSION,
  NON_RANGER,
  PROSPECTIVE,
  RETIRED,
} from 'clubhouse/constants/person_status';
import requestYear from 'clubhouse/utils/request-year';
import BmidModel, {DO_NOT_PRINT, ISSUES, PRINTED, SUBMITTED} from "clubhouse/models/bmid";

const ALLOWED_STATUSES = [
  ACTIVE,
  ALPHA,
  ECHELON,
  INACTIVE,
  INACTIVE_EXTENSION,
  NON_RANGER,
  PROSPECTIVE,
  RETIRED,
];

export default class VcBmidPrintRoute extends ClubhouseRoute {
  roleRequired = [ADMIN, EDIT_BMIDS];
  queryParams = {
    year: {refreshModel: true},
    filter: {refreshModel: true},
  };

  async model(params) {
    const year = requestYear(params);
    const filter = params.filter || 'special';

    const [{bmids}, {exports}] = await Promise.all([
      this.ajax.request(`bmid/manage`, {data: {year, filter}}),
      this.ajax.request('bmid/exports', {data: {year}})
    ]);

    return {
      year,
      filter,
      bmids,
      exportList: exports
    };
  }

  setupController(controller, model) {
    const bmids = [], doNotPrint = [], issues = [],
      printed = [], submitted = [], unusualStatus = [], noPhoto = [], notQualifiedToPrint = [];

    controller.set('year', model.year);
    controller.set('filter', model.filter);
    controller.set('exportList', model.exportList);
    controller.set('batchForm', {});

    this.store.unloadAll('bmid');

    BmidModel.pushToStore(this, model.bmids).forEach((bmid) => {
      switch (bmid.status) {
        case DO_NOT_PRINT:
          doNotPrint.push(bmid);
          return;

        case ISSUES:
          issues.push(bmid);
          return;

        case PRINTED:
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
        bmid.selected = 1;
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
