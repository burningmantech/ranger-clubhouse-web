import Controller from '@ember/controller';
import {action} from '@ember/object';
import {set} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {isEmpty} from '@ember/utils';

export default class VcBmidPrintController extends Controller {
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
  sendToLambase(model) {
    const batch_info = model.batchInfo;

    this.modal.confirm('Confirm Submitting To Lambase',
      `${this.bmidsSelectedCount} BMID(s) have been selected to print. Are you sure you want to do this?`,
      () => {
        const person_ids = this.viewBmids.reduce((ids, bmid) => {
          if (bmid.selected) {
            ids.push(bmid.person_id);
          }
          return ids;
        }, []);

        this.isSubmitting = true;
        this.ajax.request(`bmid/lambase`, {method: 'POST', data: {year: this.year, person_ids, batch_info}})
          .then((result) => {
            result.bmids.forEach((bmid) => {
              const found = this.bmids.find((needle) => needle.person_id == bmid.person_id);

              if (found) {
                set(found, 'status', bmid.status);
              }
            });

            this.toast.success('BMID(s) send to Lambase.');
          }).catch((response) => this.house.handleErrorResponse(response))
          .finally(() => this.isSubmitting = false);
      }
    );
  }
}
