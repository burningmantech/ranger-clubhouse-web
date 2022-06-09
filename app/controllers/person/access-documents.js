import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import admissionDateOptions from 'clubhouse/utils/admission-date-options';
import {StateOptions} from 'clubhouse/constants/countries';
import {
  STAFF_CREDENTIAL,
  RPT,
  GIFT_TICKET,
  VEHICLE_PASS,
  WAP,
  WAPSO,
  ALL_EAT_PASS,
  EVENT_EAT_PASS,
  PRE_EVENT_EAT_PASS,
  POST_EVENT_EAT_PASS,
  PRE_POST_EAT_PASS,
  PRE_EVENT_EVENT_EAT_PASS,
  EVENT_POST_EAT_PASS,
  EVENT_RADIO,
  WET_SPOT,
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
  DELIVERY_WILL_CALL
} from 'clubhouse/models/access-document';

export default class PersonAccessDocumentsController extends ClubhouseController {
  @tracked isSubmitting = false;
  @tracked isShowingAll = false;

  @tracked documents = null;
  @tracked entry = null;

  typeOptions = [
    [ 'Select Type', '' ],
    {
      groupName: 'Tickets/VP',
      options: [
        ["Staff Credential", STAFF_CREDENTIAL],
        ["Reduced-Price Ticket", RPT],
        ["Gift Ticket", GIFT_TICKET],
        ["Vehicle Pass", VEHICLE_PASS],
      ],
    },
    {
      groupName: 'Work Access Passes',
      options: [
        ["Work Access Pass", WAP],
        ["Work Access Pass (SO)", WAPSO],
      ],
    },
    {
      groupName: 'Meal Provisions',
      options: [
        ['All Eat Pass', ALL_EAT_PASS],
        ['Event Week Meal Pass', EVENT_EAT_PASS],
        ['Pre-Event Meal Pass', PRE_EVENT_EAT_PASS],
        ['Pre-Event + Event Meal Pass', PRE_EVENT_EVENT_EAT_PASS],
        ['Pre+Post Meal Pass', PRE_POST_EAT_PASS ],
        ['Event + Post-Event Meal Pass', EVENT_POST_EAT_PASS],
        ['Post-Event Meal Pass', POST_EVENT_EAT_PASS],
      ]
    },
    {
      groupName: 'Other Provisions',
      options: [
        ['Event Radio', EVENT_RADIO],
        ['Wet Spot Access', WET_SPOT],
      ]

    }
  ];

  statusOptions = [
    ["Qualified", QUALIFIED],
    ["Claimed", CLAIMED],
    ["Banked", BANKED],
    ["Submitted", SUBMITTED],
    ["Used", USED],
    ["Cancelled", CANCELLED],
    ["Expired", EXPIRED]
  ];

  deliveryMethodOptions = [
    ['None', DELIVERY_NONE],
    ['US Mail', DELIVERY_POSTAL],
    ['Will Call', DELIVERY_WILL_CALL],
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

    const isNew = model.isNew;

    model.save().then(() => {
      this.entry = null;
      this.toast.success(`The access document was successfully ${isNew ? 'created' : 'updated'}.`);
      if (isNew) {
        this.documents.update();
      }
    }).catch((response) => this.house.handleErrorResponse(response, model));
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

  get isTicketingOpen() {
    return this.ticketingInfo.period === 'open';
  }
}
