import Controller from '@ember/controller';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import admissionDateOptions from 'clubhouse/utils/admission-date-options';
import {StateOptions} from 'clubhouse/constants/countries';

export default class PersonAccessDocumentsController extends Controller {
  @tracked isSubmitting = false;
  @tracked isShowingAll = false;

  @tracked documents = null;
  @tracked entry = null;
  @tracked delivery;
  @tracked deliveryEntry = null;

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
    ["Will Call", 'will_call'],
    ["US Mail", 'mail']
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
    return admissionDateOptions(this.house.currentYear(), this.ticketingInfo.wap_date_range, this.entry.admission_date);
  }

  @action
  newAccessDocument() {
    const currentYear = this.house.currentYear();

    this.entry = this.store.createRecord('access-document', {
      person_id: this.person.id,
      type: 'staff_credential',
      status: 'qualified',
      source_year: currentYear,
      expiry_year: currentYear + 3,
      admission_date: null,
    });
  }

  @action
  editAccessDocument(document) {
    this.entry = document;
    document.set('additional_comments', '');
  }

  @action
  cancelAccessDocument() {
    this.entry = null;
  }

  @action
  saveAccessDocument(model, isValid) {
    if (!isValid) {
      return;
    }

    const isNew = model.isNew;

    model.save().then(() => {
      this.entry = null;
      this.toast.success(`The access document was successfully ${isNew ? 'created' : 'updated'}.`);
      if (isNew) {
        this.documents.update();
      }
    })
      .catch((response) => this.house.handleErrorResponse(response, model));
  }

  @action
  deleteAccessDocument(document) {
    this.modal.confirm('Confirm Delete Document', 'Are you sure you want to delete this document? This operation cannot be undone.', () => {
      document.destroyRecord().then(() => {
        this.entry = null;
        this.toast.success('The document was successfully deleted.');
      }).catch((response) => this.house.handleErrorResponse(response));
    });
  }

  @action
  editDelivery() {
    let delivery = this.delivery;

    if (!delivery) {
      delivery = {method: 'will_call'};
    }

    this.deliveryEntry = delivery;
  }

  @action
  cancelDelivery() {
    this.deliveryEntry = null;
  }

  @action
  saveDelivery(model, isValid) {
    if (!isValid)
      return;

    this.isSubmitting = true;
    this.toast.clear();
    const delivery = {
      method: model.method,
      street: model.street,
      city: model.city,
      state: model.state,
      postal_code: model.postal_code,
      //  country: model.get('country'),
      country: 'United States'
    };

    this.ajax.request(`ticketing/${this.person.id}/delivery`, {
      method: 'POST',
      data: delivery
    })
      .then(() => {
        this.toast.success('The delivery method and/or address was successfully saved.');
        this.delivery = delivery;
        this.deliveryEntry = null;
      }).catch((response) => this.house.handleErrorResponse(response, model))
      .finally(() => this.isSubmitting = false);
  }

  @action
  showAction() {
    this.isLoading = true;

    const data = {person_id: this.person.id};
    if (!this.isShowingAll) {
      data.status = 'all';
    }
    this.store.query('access-document', data).then((documents) => {
      this.documents = documents;
      this.isShowingAll = !this.isShowingAll;
    }).catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.isLoading = false);
  }
}
