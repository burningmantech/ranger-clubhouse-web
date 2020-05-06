import Controller from '@ember/controller';
import { action } from '@ember/object';
import admissionDateOptions from 'clubhouse/utils/admission-date-options';
import { StateOptions } from 'clubhouse/constants/countries';

export default class PersonAccessDocumentsController extends Controller {
  entry = null;

  typeOptions = [
    ["Staff Credential", "staff_credential"],
    ["Reduced-Price Ticket", "reduced_price_ticket"],
    ["Gift Ticket", "gift_ticket"],
    ["Work Access Pass", "work_access_pass"],
    ["Work Access Pass (SO)", "work_access_pass_so"],
    ["Vehicle Pass", "vehicle_pass"],
  ];

  statusOptions = [
    ["Qualified", "qualified"],
    ["Claimed", "claimed"],
    ["Banked", "banked"],
    ["Submitted", "submitted"],
    ["Used", "used"],
    ["Cancelled", "cancelled"],
    ["Expired", "expired"]
  ];

  methodOptions = [
    [ "Will Call", 'will_call' ],
    [ "US Mail", 'mail' ]
  ];

  stateOptions = StateOptions['US'];

  get yearOptions() {
    const currentYear = this.house.currentYear();
    const years = [];
    for (let year = currentYear - 5; year < currentYear + 5; year++) {
      years.push(year);
    }

    return years;
  }

  get admissionDateOptions() {
    return admissionDateOptions(this.house.currentYear(), this.ticketingInfo.wap_date_range);
  }

  @action
  newAccessDocument() {
    const currentYear = this.house.currentYear();

    this.set('entry', this.store.createRecord('access-document', {
      person_id: this.person.id,
      type: 'staff_credential',
      status: 'qualified',
      source_year: currentYear,
      expiry_year: currentYear + 3,
      admission_date: null,
    }));
  }

  @action
  editAccessDocument(document) {
    this.set('entry', document);
    document.set('additional_comments', '');
  }

  @action
  cancelAccessDocument() {
    this.set('entry', null)
  }

  @action
  saveAccessDocument(model, isValid) {
    if (!isValid) {
      return;
    }

    const isNew = model.get('isNew');

    model.save().then(() => {
        this.set('entry', null);
        this.toast.success(`The access document was successfully ${isNew ? 'created' : 'updated'}.`);
        if (isNew) {
          this.documents.update();
        }
      })
      .catch((response) => {
        this.house.handleErrorResponse(response);
      })
  }

  @action
  deleteAccessDocument(document) {
    this.modal.confirm('Confirm Delete Document', 'Are you sure you want to delete this document? This operation cannot be undone.', () => {
      document.destroyRecord().then(() => {
        this.set('entry', null);
        this.toast.success('The document was successfully deleted.');
      }).catch((response) => this.house.handleErrorResponse(response));
    });
  }

  @action
  editDelivery() {
    let delivery = this.delivery;

    if (!delivery) {
      delivery =  { method: 'will_call' };
    }

    this.set('deliveryEntry', delivery);
  }

  @action
  cancelDelivery() {
    this.set('deliveryEntry', null);
  }

  @action
  saveDelivery(model, isValid) {
    if (!isValid)
      return;

    this.set('isSubmitting', false);
    this.toast.clear();
    const delivery = {
      method:  model.get('method'),
      street: model.get('street'),
      city: model.get('city'),
      state: model.get('state'),
      postal_code: model.get('postal_code'),
      //  country: model.get('country'),
      country: 'United States'
    };

    this.ajax.request(`ticketing/${this.person.id}/delivery`, {
        method: 'POST',
        data: delivery
      })
      .then(() => {
        this.toast.success('The delivery method and/or address was successfully saved.');
        this.set('delivery', delivery);
        this.set('deliveryEntry', null);
      }).catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.set('isSubmitting', false));
  }
}
