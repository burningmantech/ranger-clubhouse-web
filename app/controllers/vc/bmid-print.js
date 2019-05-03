import Controller from '@ember/controller';
import { action, computed } from '@ember/object';
import { set } from '@ember/object';

export default class VcBmidPrintController extends Controller {
  queryParams = [ 'year', 'filter' ];

  batchForm = {};

  filterOptions = [
    [ 'Specials (titles, meals, showers, or early arrival)', 'special' ],
    [ 'Alphas', 'alpha' ],
    [ 'Vets w/shift after 8/15 OR PASSED training; excludes PNVs', 'signedup' ],
  ];

  @computed('bmids.@each.selected')
  get bmidsSelectedCount() {
    return this.bmids.reduce((total, bmid) => (bmid.selected ? 1 : 0)+total, 0);
  }

  @action
  sendToLambase(model) {
    const batch_info = model.get('batchInfo');

    this.modal.confirm('Confirm Submitting To Lambase',
      `${this.bmidsSelectedCount} BMID(s) have been selected to print. Are you sure you want to do this?`,
      () => {
        const person_ids = this.bmids.reduce((ids, bmid) => {
          if (bmid.selected) {
            ids.push(bmid.person_id);
          }
          return ids;
        }, []);

        this.set('isSubmitting', true);
        this.ajax.request(`bmid/lambase`, { method: 'POST', data: { year: this.year, person_ids, batch_info }}).then((result) => {
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
