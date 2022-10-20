import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {isEmpty} from '@ember/utils';

export default class VcBmidPrintController extends ClubhouseController {
  queryParams = ['filter'];

  @tracked batchForm = {};

  filterOptions = [
    ['Specials (titles, meals, showers, or early arrival)', 'special'],
    ['Alphas', 'alpha'],
    ['Vets w/shift after 8/10 OR PASSED training; excludes PNVs', 'signedup'],
  ];

  textFilterFields = [
    'person.callsign',
    'title1',
    'title2',
    'title3',
    'teams',
    'notes'
  ];

  @tracked bmids;

  @tracked textFilter;
  @tracked textFilterInput = '';
  @tracked textFilterError = '';

  @tracked isSubmitting = false;

  @tracked bmidsSelectedCount = 0;
  @tracked viewBmids;

  @tracked isExporting = false;
  @tracked exportList = [];

  _buildViewBmids() {
    let bmids = this.bmids;

    if (isEmpty(this.textFilter)) {
      this.viewBmids = bmids;
      this._updateSelectedCount();
    }

    const regexp = new RegExp(this.textFilter, 'i');

    bmids = bmids.filter((bmid) => {
      let haveMatch = false;
      this.textFilterFields.forEach((field) => {
        const value = bmid.get(field);

        if (!isEmpty(value) && regexp.test(value)) {
          haveMatch = true;
        }
      });

      return haveMatch;
    });

    this.viewBmids = bmids;
    this._updateSelectedCount();
  }

  @action
  toggleBmid(bmid) {
    if (bmid) {
      bmid.set('selected', !bmid.selected);
    }

    this._updateSelectedCount();
  }

  _updateSelectedCount() {
    this.bmidsSelectedCount = this.viewBmids.reduce((total, bmid) => (bmid.selected ? 1 : 0) + total, 0);
  }

  @action
  textFilterAction() {
    this.textFilterError = '';
    const filter = this.textFilterInput;

    if (isEmpty(filter)) {
      return;
    }

    try {
      RegExp(filter);
      this.textFilter = filter;
      this._buildViewBmids();
    } catch (e) {
      this.textFilterError = e.toString();
    }
  }

  @action
  clearTextFilterAction() {
    this.textFilter = '';
    this.textFilterInput = '';
    this.textFilterError = '';
    this._buildViewBmids();
  }

  @action
  exportAction(model) {
    const person_ids = this.viewBmids.reduce((ids, bmid) => {
      if (bmid.selected) {
        ids.push(bmid.person_id);
      }
      return ids;
    }, []);

    const batchText = isEmpty(model.batchInfo) ?
      '<b class="text-danger">You have not entered any text into the Batch Information field.</b> Please confirm this is your intent.' :
      `<b>The batch information entered is "<i>${model.batchInfo}</i>"</b>`;

    this.modal.confirm('Confirm Export',
      `<p>${batchText}</p>${person_ids.length} BMID(s) have been selected to download and marked as SUBMITTED. Are you sure you want to do this?`,
      () => {
        this.isExporting = true;
        this.ajax.request('bmid/export', {
          method: 'POST',
          data: {year: this.year, person_ids, batch_info: model.batchInfo}
        }).then(({export_url, bmids}) => {
          this.isExporting = false;
          bmids.forEach((bmid) => {
            const update = this.viewBmids.find((b) => b.person_id === bmid.person_id);
            if (update) {
              Object.assign(update, bmid);
            }
          });
          this.ajax.request('bmid/exports', {data: {year: this.year}})
            .then((result) => this.exportList = result.exports);
          this.house.downloadUrl(export_url);
        }).catch((response) => this.house.handleErrorResponse(response))
          .finally(() => this.isExporting = false);
      }
    );
  }
}
