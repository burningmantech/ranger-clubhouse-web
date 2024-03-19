import Component from '@glimmer/component';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {service} from '@ember/service';
import {isEmpty} from '@ember/utils';
import admissionDateOptions from 'clubhouse/utils/admission-date-options';
import {StateOptions} from 'clubhouse/constants/countries';
import {
  STAFF_CREDENTIAL,
  SPT,
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
  @service ajax;
  @service house;
  @service modal;
  @service store;
  @service toast;

  @tracked isSubmitting = false;
  @tracked isShowingAll = false;

  @tracked documents = null;
  @tracked entry = null;
  @tracked entryChanges = null;
  @tracked showingChanges = false;

  typeOptions = [
    {
      groupName: 'Regular Items',
      options: [
        ["Special Price Ticket", SPT],
        ["Staff Credential", STAFF_CREDENTIAL],
        ["Setup Access Pass", WAP],
        ["S.O. Setup Access Pass", WAPSO],
        ['Vehicle Pass', VEHICLE_PASS],
      ]
    },
    {
      groupName: 'Gift Items',
      options: [
        ["Gift Ticket", GIFT_TICKET],
        ['Gift Vehicle Pass', VEHICLE_PASS_GIFT],
      ]
    },
    {
      groupName: 'Late Season Directed',
      options: [
        ["LSD Ticket", LSD_TICKET],
        ['LSD Vehicle Pass', VEHICLE_PASS_LSD],
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
    for (let year = currentYear - 5; year < currentYear + 10; year++) {
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

    this.showingChanges = null;
    this.entry = this.store.createRecord('access-document', {
      person_id: this.args.person.id,
      type: SPT,
      status: QUALIFIED,
      source_year: currentYear,
      expiry_date: `${currentYear + 3}-09-15`,
      delivery_method: DELIVERY_NONE,
    });
  }

  @action
  async editAccessDocument(document) {
    try {
      this.showingChanges = false;
      await document.reload();
      document.set('additional_comments', '');
      this.entry = document;
    } catch (response) {
      this.house.handleErrorResponse(response);
    }
  }

  @action
  cancelAccessDocument() {
    this.entry = null;
  }

  @action
  async saveAccessDocument(model, isValid) {
    if (!isValid) {
      return;
    }

    const {isNew} = model;

    try {
      await model.save();
      this.entry = null;
      this.toast.success(`The access document was successfully ${isNew ? 'created' : 'updated'}.`);
      if (isNew) {
        this.documents.update();
      }
    } catch (response) {
      this.house.handleErrorResponse(response);
    }
  }

  /**
   * Delete an access document
   *
   * @param {AccessDocumentModel} document
   */

  @action
  async deleteAccessDocument(document) {
    this.modal.confirm('Confirm Delete Document',
      'Are you sure you want to delete this document? This operation cannot be undone.',
      async () => {
        try {
          await document.destroyRecord();
          this.entry = null;
          this.toast.success('The document was successfully deleted.');
        } catch (response) {
          this.house.handleErrorResponse(response)
        }
      });
  }

  @action
  async showAction() {
    this.isLoading = true;

    const data = {person_id: this.args.person.id};
    if (!this.isShowingAll) {
      data.status = 'all';
    }

    try {
      this.documents = await this.store.query('access-document', data);
      this.isShowingAll = !this.isShowingAll;
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isLoading = false;
    }
  }

  @action
  async toggleChanges() {
    if (this.showingChanges) {
      this.showingChanges = false;
      return;
    }

    this.isLoading = true;
    try {
      this.entryChanges = (await this.ajax.request(`access-document/${this.entry.id}/changes`)).changes;
      this.showingChanges = true;
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isLoading = false;
    }
  }

  get isTicketingOpen() {
    return this.args.ticketingInfo.period === 'open';
  }

  humanizeColumn(column) {
    return column.split(/_+/g)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  valueChange(value) {
    return isEmpty(value) ? 'blank' : value;
  }

  @action
  changeArray(row) {
    if (row.operation !== 'modify') {
      return [];
    }

    const columns = [];
    const {changes} = row;
    if (Array.isArray(changes)) {
      // Old style

      changes.forEach((c) => {
        if (c[0] === 'id' || c[0] === 'comments') {
          return;
        }
        columns.push({
          column: this.humanizeColumn(c[0]),
          oldValue: this.valueChange(c[1]),
          newValue: this.valueChange(c[2])
        });

      });
    } else {
      // New style
      Object.keys(changes).forEach((key) => {
          if (key === 'id' || key === 'comments') {
            return;
          }
          columns.push({
            column: this.humanizeColumn(key),
            oldValue: this.valueChange(changes[key][0]),
            newValue: this.valueChange(changes[key][1])
          });
        }
      );
    }

    return columns;
  }
}
