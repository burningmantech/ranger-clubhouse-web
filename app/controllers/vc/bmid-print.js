import Controller from '@ember/controller';
import { action, computed } from '@ember/object';
import { set } from '@ember/object';
import { isEmpty } from '@ember/utils';

export default class VcBmidPrintController extends Controller {
  queryParams = ['filter'];

  batchForm = {};

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

  @computed('textFilter', 'bmids')
  get viewBmids() {
    let bmids = this.bmids;

    if (isEmpty(this.textFilter)) {
      return bmids;
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

    return bmids;
  }

  @computed('viewBmids.@each.selected')
  get bmidsSelectedCount() {
    return this.viewBmids.reduce((total, bmid) => (bmid.selected ? 1 : 0) + total, 0);
  }

  @action
  textFilterAction() {
    this.set('textFilterError', '');
    const filter = this.textFilterInput;

    if (isEmpty(filter)) {
      return;
    }

    try {
      RegExp(filter);
      this.set('textFilter', filter);
    } catch (e) {
      this.set('textFilterError', e.toString());
    }
  }

  @action
  clearTextFilterAction() {
    this.set('textFilter', '');
    this.set('textFilterInput', '');
    this.set('textFilterError', '');
  }


  @action
  sendToLambase(model) {
    const batch_info = model.get('batchInfo');

    this.modal.confirm('Confirm Submitting To Lambase',
      `${this.bmidsSelectedCount} BMID(s) have been selected to print. Are you sure you want to do this?`,
      () => {
        const person_ids = this.viewBmids.reduce((ids, bmid) => {
          if (bmid.selected) {
            ids.push(bmid.person_id);
          }
          return ids;
        }, []);

        this.set('isSubmitting', true);
        this.ajax.request(`bmid/lambase`, { method: 'POST', data: { year: this.year, person_ids, batch_info } }).then((result) => {
            result.bmids.forEach((bmid) => {
              const found = this.bmids.find((needle) => needle.person_id == bmid.person_id);

              if (found) {
                set(found, 'status', bmid.status);
              }
            });

            this.toast.success('BMID(s) send to Lambase.');
          }).catch((response) => this.house.handleErrorResponse(response))
          .finally(() => this.set('isSubmitting', false));
      }
    );
  }
}
