import Controller from '@ember/controller';
import { action, computed } from '@ember/object';
import admissionDateOptions from 'clubhouse/utils/admission-date-options';

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

  @computed
  get yearOptions() {
    const currentYear = (new Date()).getFullYear();
    const years = [];
    for (let year = currentYear - 4; year < currentYear + 4; year++) {
      years.push(year);
    }

    return years;
  }

  @computed
  get admissionDateOptions() {
    return admissionDateOptions(this.house.currentYear(), this.ticketingInfo.wap_date_range);
  }

  @action
  newAccessDocument() {
    const currentYear = (new Date()).getFullYear();

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
}
