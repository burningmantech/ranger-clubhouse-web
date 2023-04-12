import Component from '@glimmer/component';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {service} from '@ember/service';
import admissionDateOptions from 'clubhouse/utils/admission-date-options';
import {StateOptions} from 'clubhouse/constants/countries';
import {
  STAFF_CREDENTIAL,
  RPT,
  GIFT_TICKET,
  LSD_TICKET,
  VEHICLE_PASS,
  VEHICLE_PASS_GIFT,
  VEHICLE_PASS_LSD,
  WAP,
  WAPSO,
  // Statuses
  BANKED,
  CANCELLED,
  CLAIMED,
  EXPIRED,
  QUALIFIED,
  SUBMITTED,
  USED,
  DELIVERY_NONE,
  DELIVERY_POSTAL,
  DELIVERY_WILL_CALL, TURNED_DOWN
} from 'clubhouse/models/access-document';

export default class PersonAccessDocumentsComponent extends Component {
  @service house;
  @service modal;
  @service store;
  @service toast;

  @tracked isSubmitting = false;
  @tracked isShowingAll = false;

  @tracked documents = null;
  @tracked entry = null;

  typeOptions = [
    {
      groupName: 'Regular Items',
      options: [
        ["Reduced-Price Ticket", RPT],
        ["Staff Credential", STAFF_CREDENTIAL],
        ["Work Access Pass", WAP],
        ["S.O. Work Access Pass", WAPSO],
        ['Vehicle Pass', VEHICLE_PASS],
      ]
    },
    {
      groupName: 'Gift Items',
      options: [
        ["Gift Ticket", GIFT_TICKET],
        ['Vehicle Pass (Gift)', VEHICLE_PASS_GIFT],
      ]
    },
    {
      groupName: 'Late Season Directed',
      options: [
        ["LSD Ticket", LSD_TICKET],
        ['Vehicle Pass (LSD)', VEHICLE_PASS_LSD],
      ]
    }
  ];

  statusOptions = [
    ["Banked", BANKED],
    ["Cancelled", CANCELLED],
    ["Claimed", CLAIMED],
    ["Expired", EXPIRED],
    ["Qualified", QUALIFIED],
    ["Submitted", SUBMITTED],
    ["Turned Down", TURNED_DOWN],
    ["Used", USED],
  ];

  deliveryMethodOptions = [
    ['None', DELIVERY_NONE],
    ['US Mail', DELIVERY_POSTAL],
    ['Will Call', DELIVERY_WILL_CALL],
  ];

  stateOptions = StateOptions['US'];

  constructor() {
    super(...arguments);
    this.documents = this.args.documents;
  }

  get yearOptions() {
    const currentYear = this.house.currentYear();
    const years = [];
    for (let year = currentYear - 5; year < currentYear + 5; year++) {
      years.push(year);
    }

    return years;
  }

  get admissionDateOptions() {
    return admissionDateOptions(this.house.currentYear(), this.args.ticketingInfo.wap_date_range, this.entry.admission_date);
  }

  @action
  newAccessDocument() {
    const currentYear = this.house.currentYear();

    this.entry = this.store.createRecord('access-document', {
      person_id: this.args.person.id,
      type: RPT,
      status: QUALIFIED,
      source_year: currentYear,
      expiry_date: `${currentYear + 3}-09-15`,
      delivery_method: DELIVERY_NONE,
    });
  }

  @action
  editAccessDocument(document) {
    document.reload().then(() => {
      this.entry = document;
      document.set('additional_comments', '');
    }).catch((response) => this.house.handleErrorResponse(response));
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

    const {isNew} = model;

    model.save().then(() => {
      this.entry = null;
      this.toast.success(`The access document was successfully ${isNew ? 'created' : 'updated'}.`);
      if (isNew) {
        this.documents.update();
      }
    }).catch((response) => this.house.handleErrorResponse(response, model));
  }

  /**
   * Delete an access document
   *
   * @param {AccessDocumentModel} document
   */

  @action
  deleteAccessDocument(document) {
    this.modal.confirm('Confirm Delete Document',
      'Are you sure you want to delete this document? This operation cannot be undone.',
      () => {
        document.destroyRecord().then(() => {
          this.entry = null;
          this.toast.success('The document was successfully deleted.');
        }).catch((response) => this.house.handleErrorResponse(response));
      });
  }

  @action
  showAction() {
    this.isLoading = true;

    const data = {person_id: this.args.person.id};
    if (!this.isShowingAll) {
      data.status = 'all';
    }
    this.store.query('access-document', data)
      .then((documents) => {
        this.documents = documents;
        this.isShowingAll = !this.isShowingAll;
      }).catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.isLoading = false);
  }

  get isTicketingOpen() {
    return this.args.ticketingInfo.period === 'open';
  }
}
