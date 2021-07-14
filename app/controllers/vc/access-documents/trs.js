import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action, set} from '@ember/object';
import {isBlank, isEmpty} from '@ember/utils';
import dayjs from 'dayjs';
import {tracked} from '@glimmer/tracking';
import {GIFT_TICKET, STAFF_CREDENTIAL, RPT, WAP, WAPSO, VEHICLE_PASS, DELIVERY_POSTAL} from 'clubhouse/models/access-document';
import {ALPHA, PROSPECTIVE} from 'clubhouse/constants/person_status';

const SHORT_TYPES = {
  [GIFT_TICKET]: 'GIFT',
  [RPT]: 'RPT',
  [STAFF_CREDENTIAL]: 'SC',
  [VEHICLE_PASS]: 'VP',
  [WAPSO]: 'SOWAP',
  [WAP]: 'WAP',
};

const TRS_COLUMN = {
  [STAFF_CREDENTIAL]: 'sc',
  [RPT]: 'rpt',
  [GIFT_TICKET]: 'gift_ticket',
  [VEHICLE_PASS]: 'vp',
  [WAP]: 'wap',
  [WAPSO]: 'wap'
};

const PAID_EXPORT_FORMAT = [
  ['First Name', 'first_name'],
  ['Last Name', 'last_name'],
  ['Email', 'email'],
  ['Question: Method Of Delivery', 'delivery_type'],
  ['Question: Nickname/Project:', 'project_name'],
  ['Question: Notes:', 'note'],
  ['Request: $210 Ticket', 'rpt'],
  ['Request: $100 Vehicle Pass', 'vp'],
  ['Request: Transferrable $210 Ticket', 'rpt_xfer'],
  ['Request: Transferrable $100 Vehicle Pass', 'vp_xfer']
];

const UNPAID_EXPORT_FORMAT = [
  ['First Name', 'first_name'],
  ['Last Name', 'last_name'],
  ['Email', 'email'],
  ['Question: Method of Delivery', 'delivery_type'],
  ['Question: Nickname/Project', 'project_name'],
  ['Question: Notes', 'note'],
  ['Shipping Address (Required if Mail Delivery type selected): Country', 'country'],
  ['Shipping Address (Required if Mail Delivery type selected): Full Name', 'full_name'],
  ['Shipping Address (Required if Mail Delivery type selected): Address', 'address1'],
  ['Shipping Address (Required if Mail Delivery type selected): Address Line 2', 'address2'],
  ['Shipping Address (Required if Mail Delivery type selected): City', 'city'],
  ['Shipping Address (Required if Mail Delivery type selected): State', 'state'],
  ['Shipping Address (Required if Mail Delivery type selected): Zip', 'zip'],
  ['Shipping Address (Required if Mail Delivery type selected): Phone', 'phone'],
  ['Request: Gift Ticket', 'gift_ticket'],
  ['Request: Gift Vehicle Pass', 'vp'],
  ['Request: STAFF WAP 8/3 & Later', 'wap_0803'],
  ['Request: STAFF WAP 8/4 & Later', 'wap_0804'],
  ['Request: STAFF WAP 8/5 & Later', 'wap_0805'],
  ['Request: STAFF WAP 8/6 & Later', 'wap_0806'],
  ['Request: STAFF WAP 8/7 & Later', 'wap_0807'],
  ['Request: STAFF WAP 8/8 & Later', 'wap_0808'],
  ['Request: STAFF WAP 8/9 & Later', 'wap_0809'],
  ['Request: STAFF WAP 8/10 & Later', 'wap_0810'],
  ['Request: STAFF WAP 8/11 & Later', 'wap_0811'],
  ['Request: STAFF WAP 8/12 & Later', 'wap_0812'],
  ['Request: STAFF WAP 8/13 & Later', 'wap_0813'],
  ['Request: STAFF WAP 8/14 & Later', 'wap_0814'],
  ['Request: STAFF WAP 8/15 & Later', 'wap_0815'],
  ['Request: STAFF WAP 8/16 & Later', 'wap_0816'],
  ['Request: STAFF WAP 8/17 & Later', 'wap_0817'],
  ['Request: STAFF WAP 8/18 & Later', 'wap_0818'],
  ['Request: STAFF WAP 8/19 & Later', 'wap_0819'],
  ['Request: STAFF WAP 8/20 & Later', 'wap_0820'],
  ['Request: STAFF WAP 8/21 & Later', 'wap_0821'],
  ['Request: STAFF WAP 8/22 & Later', 'wap_0822'],
  ['Request: STAFF WAP 8/23 & Later', 'wap_0823'],
  ['Request: STAFF WAP 8/24 & Later', 'wap_0824'],
  ['Request: STAFF WAP - Anytime', 'wap_anytime'],
  ['Request: Staff Credential Pickup 8/3 & After', 'sc_0803'],
  ['Request: Staff Credential Pickup 8/4 & After', 'sc_0804'],
  ['Request: Staff Credential Pickup 8/5 & After', 'sc_0805'],
  ['Request: Staff Credential Pickup 8/6 & After', 'sc_0806'],
  ['Request: Staff Credential Pickup 8/7 & After', 'sc_0807'],
  ['Request: Staff Credential Pickup 8/8 & After', 'sc_0808'],
  ['Request: Staff Credential Pickup 8/9 & After', 'sc_0809'],
  ['Request: Staff Credential Pickup 8/10 & After', 'sc_0810'],
  ['Request: Staff Credential Pickup 8/11 & After', 'sc_0811'],
  ['Request: Staff Credential Pickup 8/12 & After', 'sc_0812'],
  ['Request: Staff Credential Pickup 8/13 & After', 'sc_0813'],
  ['Request: Staff Credential Pickup 8/14 & After', 'sc_0814'],
  ['Request: Staff Credential Pickup 8/15 & After', 'sc_0815'],
  ['Request: Staff Credential Pickup 8/16 & After', 'sc_0816'],
  ['Request: Staff Credential Pickup 8/17 & After', 'sc_0817'],
  ['Request: Staff Credential Pickup 8/18 & After', 'sc_0818'],
  ['Request: Staff Credential Pickup 8/19 & After', 'sc_0819'],
  ['Request: Staff Credential Pickup 8/20 & After', 'sc_0820'],
  ['Request: Staff Credential Pickup 8/21 & After', 'sc_0821'],
  ['Request: Staff Credential Pickup 8/22 & After', 'sc_0822'],
  ['Request: Staff Credential Pickup 8/23 & After', 'sc_0823'],
  ['Request: Staff Credential Pickup 8/24 & After', 'sc_0824'],
  ['Request: Staff Credential Pickup Anytime', 'sc_anytime'],
  ['Request: Transferrable Gift Ticket', 'xfer_gift_ticket'],
  ['Request: Transferrable Gift Vehicle Pass', 'xfer_vehicle_pass']
];

// Filter Options
const STAFF_CREDENTIAL_VP = 'staff_credential_vp';
const GIFT_TICKET_VP = 'gift_ticket_vp';

const WAP_RANGER = 'work_access_pass_ranger';
const WAP_PNV = 'work_access_pass_pnv';
const WAP_ALL = 'work_access_pass_all';

export default class VcAccessDocumentsTrsController extends ClubhouseController {
  @tracked filter = 'all';
  @tracked accessDocuments = [];
  @tracked selectAll = false;
  @tracked isSubmitting = false;
  @tracked viewRecords;
  @tracked selectedCount = 0;

  MAX_BATCH_SIZE = 2000;

  filterOptions = [
    ['All', 'all'],
    ['Staff Credentials', STAFF_CREDENTIAL],
    ['Staff Credentials+VP', STAFF_CREDENTIAL_VP],
    ['Reduced-Price Tickets', RPT],
    ['Vehicle Passes', VEHICLE_PASS],
    ['Work Access Passes Ranger', WAP_RANGER],
    ['Work Access Passes SO', WAPSO],
    ['Work Access Passes PNV', WAP_PNV],
    ['Work Access Passes All', WAP_ALL],
    ['Gift Tickets', GIFT_TICKET],
    ['Gift Tickets+VP', GIFT_TICKET_VP]
  ];

  get badRecords() {
    const records = [];

    this.people.forEach((human) => {
      human.documents.forEach((document) => {
        if (document.has_error) {
          records.push({person: human.person, document});
        }
      })
    });

    return records;
  }

  @action
  changeFilter(value) {
    this.filter = value;
    this.selectAll = false;
    this.accessDocuments.forEach((r) => set(r, 'selected', false));
    this._buildViewRecords();
    this.selectedCount = 0;
  }

  @action
  toggleRecord(rec) {
    set(rec, 'selected', !rec.selected);
    this._buildSelectedCount();
  }

  _buildSelectedCount() {
    this.selectedCount = this.viewRecords.reduce((total, r) => (r.selected ? 1 : 0) + total, 0);
  }

  _setupRecords() {
    const records = [];

    this.people.forEach((human) => {
      const person = human.person;
      const documentTypes = {};

      human.documents.forEach((doc) => {
        const type = doc.type;
        const shortType = SHORT_TYPES[type] || 'UNK';
        let trsColumn = '', dateInfo = '';

        switch (doc.type) {
          case STAFF_CREDENTIAL:
          case WAP:
          case WAPSO:
            if (doc.access_any_time || isEmpty(doc.access_date)) {
              dateInfo = ' Anytime';
              trsColumn = 'anytime';
            } else {
              dateInfo = dayjs(doc.access_date).format(' ddd MM/D');
              trsColumn = dayjs(doc.access_date).format('MMDD');
            }
            trsColumn = TRS_COLUMN[doc.type] + '_' + trsColumn;
            break;

          default:
            trsColumn = TRS_COLUMN[doc.type];
            break;
        }

        // Internal notes gets document numbers
        let note = `${shortType}${dateInfo} - RAD-${doc.id}`;

        if (doc.type === WAPSO) {
          note += ` - for ${doc.name}`;
        }

        set(doc, 'selected', false); // want to track
        doc.submitted = false;
        doc.trsNote = note;
        doc.trsColumn = trsColumn;
        doc.person = person;

        records.push(doc);

        if (!documentTypes[type]) {
          documentTypes[type] = [];
        }
        documentTypes[type].push(doc);
      });
      human.documentTypes = documentTypes;
    });

    this.accessDocuments = records;
    this._buildViewRecords();
    this.selectedCount = 0;
  }

  _buildViewRecords() {
    this.viewRecords = this._filterRecords();
  }

  _filterRecords() {
    const filter = this.filter;

    switch (filter) {
      case 'all':
        return this.accessDocuments;

      case WAP_PNV:
        return this.accessDocuments.filter((r) => r.type === WAP && (r.person.status === ALPHA || r.person.status === PROSPECTIVE));

      case WAP_RANGER:
        return this.accessDocuments.filter((r) => r.type === WAP && r.person.status !== ALPHA && r.person.status !== PROSPECTIVE);

      case WAP_ALL:
        return this.accessDocuments.filter((r) => r.type === WAP || r.type === WAPSO);

      case STAFF_CREDENTIAL_VP:
      case GIFT_TICKET_VP: {
        const rows = [];
        const isSC = (filter === STAFF_CREDENTIAL_VP);

        this.people.forEach((person) => {
          let tickets = person.documentTypes[(isSC ? STAFF_CREDENTIAL : GIFT_TICKET)] || [];
          let vp = person.documentTypes[VEHICLE_PASS] || [];

          tickets = tickets.filter((s) => !s.submitted);
          if (!tickets.length) {
            return;
          }
          vp = vp.filter((v) => !v.submitted);
          if (!vp.length) {
            return;
          }

          const documents = tickets.concat(vp), notes = [];
          documents.forEach((row) => {
            notes.push(row.trsNote)
          });

          rows.push({
            person: person.person,
            delivery_type: (isSC ? 'staff_credentialing' : tickets[0].delivery_method),
            documents,
            trsNote: notes.join('+'),
          });
        });

        return rows;
      }

      default:
        return this.accessDocuments.filter((r) => (r.type === filter));
    }
  }

  @action
  toggleAll(event) {
    const selected = event.target.checked;

    this.selectAll = selected;
    this.viewRecords.forEach((r) => set(r, 'selected', selected));
    this.selectedCount = selected ? this.viewRecords.length : 0;
  }

  _fillAddress(person, row) {
    // Provide a dummy address in case one is missing.
    row.address1 = isBlank(person.street1) ? '1 Street Address Unknown' : person.street1;
    row.address2 = person.street2;
    row.city = isBlank(person.city) ? 'Small Town' : person.city;
    row.state = isBlank(person.state) ? 'CA' : person.state;
    row.zip = isBlank(person.zip) ? '94111' : person.zip;
    row.country = isBlank(person.country) ? 'US' : person.country;

    row.phone = isBlank(person.home_phone) ? '415-555-1212' : person.home_phone;
  }

  _fillName(person, row) {
    row.first_name = person.first_name;
    row.last_name = person.last_name;
    row.full_name = `${person.first_name} ${person.last_name}`;
    row.email = person.email;
    row.project_name = `Ranger ${person.callsign}`;
  }

  @action
  exportSelectedAction() {
    const records = this.viewRecords.filter((r) => r.selected);
    const isRPT = (this.filter === RPT);
    let rows;

    if (this.filter === STAFF_CREDENTIAL_VP
      || this.filter === GIFT_TICKET_VP) {
      rows = [];
      records.forEach((rec) => {
        const {person, documents} = rec;
        let delivery_type;

        if (this.filter === STAFF_CREDENTIAL_VP) {
          delivery_type = 'Credential Pick Up';
        } else {
          delivery_type = (documents[0].delivery_method === DELIVERY_POSTAL ? 'USPS' : 'Credential Pick Up' /*'Will Call'*/);
        }

        const row = {
          delivery_type,
          note: rec.trsNote
        };

        this._fillName(person, row);
        this._fillAddress(person, row);

        let docCount = 0;
        rec.documents.forEach((doc) => {
          if (doc.submitted) {
            return;
          }

          docCount++;

          if (!row[doc.trsColumn]) {
            row[doc.trsColumn] = 1;
          } else {
            row[doc.trsColumn] += 1;
          }
        })

        if (docCount) {
          rows.push(row);
        }
      });
    } else {
      rows = records.map((doc) => {
        const person = doc.person;
        const row = {note: doc.trsNote};

        this._fillName(person, row);

        const isPostal = (doc.delivery_method === DELIVERY_POSTAL);

        switch (doc.type) {
          case RPT:
          case GIFT_TICKET:
            row.delivery_type = isPostal ? 'USPS' : 'Will Call';
            break;

          case VEHICLE_PASS:
            if (doc.has_staff_credential) {
              row.delivery_type = 'Credential Pick Up';
            } else {
              row.delivery_type = isPostal ? 'USPS' : 'Credential Pick Up';
            }
            break;

          case STAFF_CREDENTIAL:
            row.delivery_type = 'Credential Pick Up';
            break;

          case WAP:
          case WAPSO:
            row.delivery_type = 'Print At Home';
            break;
        }

        row[doc.trsColumn] = 1;

        if ((doc.type === GIFT_TICKET || doc.type === VEHICLE_PASS) && isPostal) {
          row.address1 = doc.street1;
          row.city = doc.city;
          row.state = doc.state;
          row.zip = doc.postal_code;
          row.phone = isBlank(doc.phone) ? '' : doc.phone;
          row.country = 'US';
        } else {
          this._fillAddress(person, row);
        }

        return row;
      });

    }

    const format = isRPT ? PAID_EXPORT_FORMAT : UNPAID_EXPORT_FORMAT;

    const columns = format.map((r) => {
      return {title: r[0], key: r[1]};
    });

    const date = dayjs().format('YYYY-MM-DD-HH-mm');

    this.house.downloadCsv(`trs-${this.filter.replace(/_/g, '-')}-${date}.csv`, columns, rows);
  }

  @action
  markSubmitted() {
    const ids = [];
    let itemCount = 0;

    this.viewRecords.forEach((rec) => {
      if (!rec.selected)
        return;

      if (rec.documents) {
        rec.documents.forEach((doc) => ids.push(doc.id));
      } else {
        ids.push(rec.id);
      }
      itemCount++;
    });


    this.modal.confirm('Confirm mask as submitted', `Are you sure you want to mark the ${itemCount} item(s) as submitted?`, () => {
      this.isSubmitting = true;
      this.ajax.request('access-document/mark-submitted', {method: 'POST', data: {ids}}).then(() => {
        this.toast.success('Access documents have been successfully marked as submitted.');
        this.isSubmitting = false;
        this.viewRecords.forEach((rec) => {
          if (!rec.selected)
            return;

          set(rec, 'selected', false);
          set(rec, 'submitted', true);

          if (rec.documents) {
            rec.documents.forEach((doc) => set(doc, 'submitted', true));
          }
        });
      }).finally(() => this.isSubmitting = false);
    });
  }
}
