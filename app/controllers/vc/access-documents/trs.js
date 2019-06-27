import Controller from '@ember/controller';
import { action, computed, set } from '@ember/object';
import moment from 'moment';

const SHORT_TYPES = {
  gift_ticket: 'GIFT',
  reduced_price_ticket: 'RPT',
  staff_credential: 'SC',
  vehicle_pass: 'VP',
  work_access_pass_so: 'SOWAP',
  work_access_pass: 'WAP'
};

const TRS_COLUMN = {
  'staff_credential': 'sc',
  'reduced_price_ticket': 'rpt',
  'gift_ticket': 'gift_ticket',
  'vehicle_pass': 'vp',
  'work_access_pass': 'wap',
  'work_access_pass_so': 'wap'
};

const PAID_EXPORT_FORMAT = [
  ['First Name', 'first_name'],
  ['Last Name', 'last_name'],
  ['Email', 'email'],
  ['Question: Method Of Delivery', 'delivery_method'],
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
  ['Question: Method of Delivery', 'delivery_method'],
  ['Question: Nickname/Project', 'project_name'],
  ['Question: Notes', 'note'],
  ['Shipping Address (Required if Mail Delivery type ): Country', 'country'],
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

export default class VcAccessDocumentsTrsController extends Controller {
  filter = 'all';

  MAX_BATCH_SIZE = 2000;

  filterOptions = [
    ['All', 'all'],
    ['Staff Credentials', 'staff_credential'],
    ['Reduced-Price Tickets', 'reduced_price_ticket'],
    ['Vehicle Passes', 'vehicle_pass'],
    ['Work Access Passes Ranger', 'work_access_pass_ranger'],
    ['Work Access Passes SO', 'work_access_pass_so'],
    ['Work Access Passes PNV', 'work_access_pass_pnv'],
    ['Work Access Passes All', 'work_access_pass'],
    ['Gift Tickets', 'gift_ticket']
  ];

  @computed('viewRecords.@each.selected')
  get selectedCount() {
    return this.viewRecords.reduce((total, r) => (r.selected ? 1 : 0) + total, 0);
  }

  @computed('filter', 'people')
  get badRecords() {
    const records = [];

    this.people.forEach((human) => {
      human.documents.forEach((document) => {
        if (document.has_error) {
          records.push({ person: human.person, document });
        }
      })
    });

    return records;
  }

  _setupRecords() {
    const records = [];

    this.people.forEach((human) => {
      const person = human.person;
      const delivery_method = human.delivery_method;

      human.documents.forEach((doc) => {
        const shortType = SHORT_TYPES[doc.type] || 'UNK';
        let trsColumn = '', dateInfo = '';

        switch (doc.type) {
        case 'staff_credential':
        case 'work_access_pass':
        case 'work_access_pass_so':
          if (doc.access_any_time || doc.access_date == null) {
            dateInfo = ' Anytime';
            trsColumn = 'anytime';
          } else {
            dateInfo = moment(doc.access_date).format(' ddd MM/D');
            trsColumn = moment(doc.access_date).format('MMDD');
          }
          trsColumn = TRS_COLUMN[doc.type] + '_' + trsColumn;
          break;

        default:
          trsColumn = TRS_COLUMN[doc.type];
          break;
        }

        // Internal notes gets document numbers
        let note = `${shortType}${dateInfo} - RAD-${doc.id}`;

        if (doc.type == "work_access_pass_so") {
          note += ` - for ${doc.name}`;
        }

        const record = {
          person,
          document: doc,
          delivery_method,
          note,
          trsColumn,
          selected: false,
          submitted: false
        };

        records.push(record);
      });
    });

    this.set('accessDocuments', records);
  }

  @computed('filter', 'people')
  get viewRecords() {
    const filter = this.filter;

    this.accessDocuments.forEach((r) => set(r, 'selected', false) );
    this.set('selectAll', false);

    if (filter == 'work_access_pass_pnv') {
      return this.accessDocuments.filter((r) =>  r.document.type == 'work_access_pass' && (r.person.status == 'alpha' || r.person.status == 'prospective'));
    } else if (filter == 'work_access_pass_ranger') {
      return this.accessDocuments.filter((r) =>  r.document.type == 'work_access_pass' && r.person.status != 'alpha' && r.person.status != 'prospective');
    }
    return this.accessDocuments.filter((r) => (filter == 'all' || r.document.type == filter));
  }

  @action
  toggleAll(selected) {
    this.set('selectAll', selected);
    this.viewRecords.forEach((r) => set(r, 'selected', selected));
  }


  @action
  exportSelectedAction() {
    const records = this.viewRecords.filter((r) => r.selected);
    const isRPT = (this.filter == 'reduced_price_ticket');

    const rows = records.map((rec) => {
      const person = rec.person;
      const doc = rec.document;
      const row = {
        first_name: person.first_name,
        last_name: person.last_name,
        email: person.email,
        project_name: `Ranger ${person.callsign}`,
        note: rec.note
      };

      switch (doc.type) {
      case 'reduced_price_ticket':
      case 'gift_ticket':
        row.delivery_method = doc.delivery_type == 'mail' ? 'USPS' : 'Will Call';
        break;

      case 'vehicle_pass':
        if (doc.has_staff_credential) {
          row.delivery_method = 'Credential Pick Up';
        } else {
          row.delivery_method = (doc.delivery_type == 'mail') ? 'USPS' : 'Will Call';
        }
        break;

      case 'staff_credential':
        row.delivery_method = 'Credential Pick Up';
        break;

      case 'work_access_pass':
      case 'work_access_pass_so':
        row.delivery_method = 'Print At Home';
        break;
      }

      console.log(`COL ${rec.trsColumn}`);

      row[rec.trsColumn] = 1;

      if ((doc.type == 'gift_ticket' || doc.type == 'vehicle_pass') && doc.delivery_type == 'mail') {
        const address = doc.delivery_address;
        row.full_name = `${person.first_name} ${person.last_name}`
        row.address1 = address.street;
        row.city = address.city;
        row.state = address.state;
        row.zip = address.postal_code;
        row.phone = address.phone
        row.country = 'US';
      }

      return row;
    });

    const format = isRPT ? PAID_EXPORT_FORMAT : UNPAID_EXPORT_FORMAT;

    const columns = format.map((r) => {
      return { title: r[0], key: r[1] };
    });

    const date = moment().format('YYYY-MM-DD-HH-mm');

    this.house.downloadCsv(`trs-${this.filter.replace('_','-')}-${date}`, columns, rows);
  }

  @action
  markSubmitted() {
    const ids = [];

    this.viewRecords.forEach((rec) => {
      if (!rec.selected)
        return;

      ids.push(rec.document.id);
    });

    this.modal.confirm('Confirm mask as submitted', `Are you sure you want to mark ${ids.length} as submitted?`, () => {
      this.ajax.request('access-document/mark-submitted', { data: { ids } }).then(() => {
        this.toast.success('Access documents have been succesfully marked as submitted.');
        this.viewRecords.forEach((rec) => {
          if (!rec.selected)
            return;

          set(rec, 'selected', false);
          set(rec, 'submitted', true);
        });
      });
    });
  }
}
