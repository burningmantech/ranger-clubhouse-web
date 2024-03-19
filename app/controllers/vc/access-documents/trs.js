import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action, set} from '@ember/object';
import {isBlank, isEmpty} from '@ember/utils';
import dayjs from 'dayjs';
import {cached, tracked} from '@glimmer/tracking';
import {
  DELIVERY_POSTAL,
  DELIVERY_SC,
  GIFT_TICKET,
  LSD_TICKET,
  SPT,
  STAFF_CREDENTIAL,
  VEHICLE_PASS,
  VEHICLE_PASS_GIFT,
  VEHICLE_PASS_LSD,
  WAP,
  WAPSO,
  TypeShortLabels, DeliveryMethodLabels,
} from 'clubhouse/models/access-document';
import {ALPHA, PROSPECTIVE} from 'clubhouse/constants/person_status';

const TRS_COLUMN = {
  [STAFF_CREDENTIAL]: 'sc',
  [SPT]: 'spt',
  [GIFT_TICKET]: 'gift_ticket',
  [LSD_TICKET]: 'lsd',
  [VEHICLE_PASS]: 'vp',   // VP is really a Gift VP since Rangers are not charged for it.
  [VEHICLE_PASS_GIFT]: 'vp',
  [VEHICLE_PASS_LSD]: 'lsd_vp',
  [WAP]: 'sap',
  [WAPSO]: 'sap'
};

const PAID_EXPORT_FORMAT = [
  ['First Name', 'first_name'],
  ['Last Name', 'last_name'],
  ['Email', 'email'],
  ['Question: Method Of Delivery', 'delivery_type'],
  ['Question: Nickname/Project:', 'project_name'],
  ['Question: Notes:', 'note'],
  // Shipping addresses are not used in 2022, however the headers are still present. sigh.
  // removed 'not_used_' prefix if later events requires address
  ['Shipping Address (Required if Mail Delivery type selected): Country', 'not_used_country'],
  ['Shipping Address (Required if Mail Delivery type selected): Full Name', 'not_used_full_name'],
  ['Shipping Address (Required if Mail Delivery type selected): Address', 'not_used_address1'],
  ['Shipping Address (Required if Mail Delivery type selected): Address Line 2', 'not_used_address2'],
  ['Shipping Address (Required if Mail Delivery type selected): City', 'not_used_city'],
  ['Shipping Address (Required if Mail Delivery type selected): State', 'not_used_state'],
  ['Shipping Address (Required if Mail Delivery type selected): Zip', 'not_used_zip'],
  ['Shipping Address (Required if Mail Delivery type selected): Phone', 'not_used_phone'],
  ['Request: $225 Ticket', 'spt'],
  ['Request: $150 Vehicle Pass', 'paid_vp'],
  ['Request: Gift Ticket', 'not_used_gift_ticket'],
  ['Request: Gift Vehicle Pass', 'vp'],
  ['Request: Transferrable $225 Ticket', 'spt_xfer'],
  ['Request: Transferrable $150 Vehicle Pass', 'vp_xfer'],
  ['Request: Transferrable Gift Ticket', 'gift_ticket'],
  ['Request: Transferrable Gift Vehicle Pass', 'vehicle_pass_gift'],
  // New for 2023, not used currently.
  ['Request: Transferrable $75 Vehicle Pass', 'discount_vp_xfer'],
  ['Request: $75 Vehicle Pass', 'discount_vp'],
];

const UNPAID_EXPORT_FORMAT = [
  ['First Name', 'first_name'],
  ['Last Name', 'last_name'],
  ['Email', 'email'],
  ['Question: Method of Delivery', 'delivery_type'],
  ['Question: Nickname/Project', 'project_name'],   // callsign
  ['Question: Notes', 'note'],
  // Shipping addresses are not used in 2022, however the headers are still present. sigh.
  // removed 'not_used_' prefix if later events requires address
  ['Shipping Address (Required if Mail Delivery type selected): Country', 'not_used_country'],
  ['Shipping Address (Required if Mail Delivery type selected): Full Name', 'not_used_full_name'],
  ['Shipping Address (Required if Mail Delivery type selected): Address', 'not_used_address1'],
  ['Shipping Address (Required if Mail Delivery type selected): Address Line 2', 'not_used_address2'],
  ['Shipping Address (Required if Mail Delivery type selected): City', 'not_used_city'],
  ['Shipping Address (Required if Mail Delivery type selected): State', 'not_used_state'],
  ['Shipping Address (Required if Mail Delivery type selected): Zip', 'not_used_zip'],
  ['Shipping Address (Required if Mail Delivery type selected): Phone', 'not_used_phone'],
  //['Request: Gift Ticket', 'gift_ticket'],
  ['Request: Gift Vehicle Pass', 'vp'],
  ['Request: STAFF SAP 8/6 &amp; Later', 'sap_0806'],
  ['Request: STAFF SAP 8/7 &amp; Later', 'sap_0807'],
  ['Request: STAFF SAP 8/8 &amp; Later', 'sap_0808'],
  ['Request: STAFF SAP 8/9 &amp; Later', 'sap_0809'],
  ['Request: STAFF SAP 8/10 &amp; Later', 'sap_0810'],
  ['Request: STAFF SAP 8/11 &amp; Later', 'sap_0811'],
  ['Request: STAFF SAP 8/12 &amp; Later', 'sap_0812'],
  ['Request: STAFF SAP 8/13 &amp; Later', 'sap_0813'],
  ['Request: STAFF SAP 8/14 &amp; Later', 'sap_0814'],
  ['Request: STAFF SAP 8/15 &amp; Later', 'sap_0815'],
  ['Request: STAFF SAP 8/16 &amp; Later', 'sap_0816'],
  ['Request: STAFF SAP 8/17 &amp; Later', 'sap_0817'],
  ['Request: STAFF SAP 8/18 &amp; Later', 'sap_0818'],
  ['Request: STAFF SAP 8/19 &amp; Later', 'sap_0819'],
  ['Request: STAFF SAP 8/20 &amp; Later', 'sap_0820'],
  ['Request: STAFF SAP 8/21 &amp; Later', 'sap_0821'],
  ['Request: STAFF SAP 8/22 &amp; Later', 'sap_0822'],
  ['Request: STAFF SAP 8/23 &amp; Later', 'sap_0823'],
  ['Request: STAFF SAP 8/24 &amp; Later', 'sap_0824'],
  ['Request: STAFF SAP 8/25 &amp; Later', 'sap_0825'],
  ['Request: STAFF SAP 8/26 &amp; Later', 'sap_0826'],
  ['Request: STAFF SAP 8/5 &amp; Later', 'sap_0805'],
  ['Request: STAFF SAP - Anytime', 'sap_anytime'],
  // Yes, the dates are completely out of order for 2022.
  ['Request: Staff Credential Pickup 8/26 &amp; After', 'sc_0826'],
  ['Request: Staff Credential Pickup 8/25 &amp; After', 'sc_0825'],
  ['Request: Staff Credential Pickup 8/6 &amp; After', 'sc_0806'],
  ['Request: Staff Credential Pickup 8/7 &amp; After', 'sc_0807'],
  ['Request: Staff Credential Pickup 8/8 &amp; After', 'sc_0808'],
  ['Request: Staff Credential Pickup 8/9 &amp; After', 'sc_0809'],
  ['Request: Staff Credential Pickup 8/10 &amp; After', 'sc_0810'],
  ['Request: Staff Credential Pickup 8/11 &amp; After', 'sc_0811'],
  ['Request: Staff Credential Pickup 8/12 &amp; After', 'sc_0812'],
  ['Request: Staff Credential Pickup 8/13 &amp; After', 'sc_0813'],
  ['Request: Staff Credential Pickup 8/14 &amp; After', 'sc_0814'],
  ['Request: Staff Credential Pickup 8/15 &amp; After', 'sc_0815'],
  ['Request: Staff Credential Pickup 8/16 &amp; After', 'sc_0816'],
  ['Request: Staff Credential Pickup 8/17 &amp; After', 'sc_0817'],
  ['Request: Staff Credential Pickup 8/18 &amp; After', 'sc_0818'],
  ['Request: Staff Credential Pickup 8/19 &amp; After', 'sc_0819'],
  ['Request: Staff Credential Pickup 8/20 &amp; After', 'sc_0820'],
  ['Request: Staff Credential Pickup 8/21 &amp; After', 'sc_0821'],
  ['Request: Staff Credential Pickup 8/22 &amp; After', 'sc_0822'],
  ['Request: Staff Credential Pickup 8/23 &amp; After', 'sc_0823'],
  ['Request: Staff Credential Pickup 8/24 &amp; After', 'sc_0824'],
  ['Request: Staff Credential Pickup Anytime', 'sc_anytime'],
  ['Request: Staff Credential Pickup 8/5 &amp; After', 'sc_0805'],
];

const LSD_EXPORT_FORMAT = [
  ['First Name', 'first_name'],
  ['Last Name', 'last_name'],
  ['Email', 'email'],
  ['Question: Method Of Delivery', 'delivery_type'],
  ['Question: Nickname/Project:', 'project_name'],
  ['Question: Notes:', 'note'],
  // Shipping addresses are not used in 2022, however the headers are still present. sigh.
  // removed 'not_used_' prefix if later events requires address
  ['Shipping Address (Required if Mail Delivery type selected): Country', 'not_used_country'],
  ['Shipping Address (Required if Mail Delivery type selected): Full Name', 'not_used_full_name'],
  ['Shipping Address (Required if Mail Delivery type selected): Address', 'not_used_address1'],
  ['Shipping Address (Required if Mail Delivery type selected): Address Line 2', 'not_used_address2'],
  ['Shipping Address (Required if Mail Delivery type selected): City', 'not_used_city'],
  ['Shipping Address (Required if Mail Delivery type selected): State', 'not_used_state'],
  ['Shipping Address (Required if Mail Delivery type selected): Zip', 'not_used_zip'],
  ['Shipping Address (Required if Mail Delivery type selected): Phone', 'not_used_phone'],
  ['Request: $575 Ticket', 'lsd'],
  ['Request: $150 Vehicle Pass', 'lsd_vp'],
  // Not used.
  ['Request: $2750 Ticket', 'fomo_1'],
  ['Request: $1500 Ticket', 'fomo_2'],
];


// Filter Options
const GIFT_TICKET_VP = 'gift_ticket_vp';
const LSD_TICKET_VP = 'lsd_vp';
const SPT_VP = 'spt_vp';
const STAFF_CREDENTIAL_VP = 'staff_credential_vp';

const WAP_ALL = 'work_access_pass_all';
const WAP_PNV = 'work_access_pass_pnv';
const WAP_RANGER = 'work_access_pass_ranger';

export default class VcAccessDocumentsTrsController extends ClubhouseController {
  @tracked filter = 'all';
  @tracked accessDocuments = [];
  @tracked selectAll = false;
  @tracked isSubmitting = false;
  @tracked viewRecords;
  @tracked selectedCount = 0;
  @tracked viewBadRecords = [];

  MAX_BATCH_SIZE = 2000;

  filterOptions = [
    ['All', 'all'],
    {
      groupName: 'Staff Credentials',
      options:
        [
          ['Staff Credentials', STAFF_CREDENTIAL],
          ['Staff Credentials + VP', STAFF_CREDENTIAL_VP],
        ]
    },
    {
      groupName: 'SPTs',
      options:
        [
          ['Special Price Tickets', SPT],
          ['Special Price Tickets + VP', SPT_VP],
        ]
    },
    {
      groupName: 'Vehicle Passes',
      options:
        [
          ['Vehicle Passes', VEHICLE_PASS],
          ['Gift Vehicle Passes', VEHICLE_PASS_GIFT],
          ['LSD Vehicle Passes', VEHICLE_PASS_LSD],
        ]
    },
    {
      groupName: 'Setup Access Passes',
      options:
        [
          ['SAP Ranger', WAP_RANGER],
          ['SAP SO', WAPSO],
          ['SAP PNV', WAP_PNV],
          ['SAP All', WAP_ALL],
        ]
    },
    {
      groupName: 'Special Tickets',
      options: [
        ['Gift Tickets', GIFT_TICKET],
        ['Gift Tickets + VP', GIFT_TICKET_VP],
        ['LSD Tickets', LSD_TICKET],
        ['LSD Tickets + VP', LSD_TICKET_VP],
      ]
    }
  ];

  @cached
  get badRecords() {
    const records = [];

    this.people.forEach((human) => {
      human.documents.forEach((document) => {
        if (document.has_error) {
          document.shortType = TypeShortLabels[document.type];
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
        const shortType = TypeShortLabels[type] ?? type;
        let trsColumn = '', dateInfo = '';

        switch (doc.type) {
          case STAFF_CREDENTIAL:
          case WAP:
          case WAPSO:
            if (doc.access_any_time) {
              dateInfo = ' Anytime';
              trsColumn = 'anytime';
            } else if (isEmpty(doc.access_date)) {
              dateInfo = ' UNSPECIFIED ACCESS DATE';
              trsColumn = 'unspecified';
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
    this.viewBadRecords = this.viewRecords.filter((doc) => doc.has_error);
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
      case SPT_VP:
      case GIFT_TICKET_VP:
      case LSD_TICKET_VP: {
        const rows = [];
        const isSC = (filter === STAFF_CREDENTIAL_VP);

        let ticketType, vpType;
        if (filter === STAFF_CREDENTIAL_VP) {
          ticketType = STAFF_CREDENTIAL;
          vpType = VEHICLE_PASS;
        } else if (filter === SPT_VP) {
          ticketType = SPT;
          vpType = VEHICLE_PASS;
        } else if (filter === GIFT_TICKET_VP) {
          ticketType = GIFT_TICKET;
          vpType = VEHICLE_PASS_GIFT;
        } else {
          ticketType = LSD_TICKET;
          vpType = VEHICLE_PASS_LSD;
        }

        this.people.forEach((person) => {
          let tickets = person.documentTypes[ticketType] || [];
          let vp = person.documentTypes[vpType] || [];

          tickets = tickets.filter((s) => !s.submitted);
          if (!tickets.length) {
            return;
          }
          vp = vp.filter((v) => !v.submitted);
          if (!vp.length) {
            return;
          }

          const documents = tickets.concat(vp), notes = [];
          documents.forEach((row) => notes.push(row.trsNote));

          const has_error = !!documents.find((doc) => doc.has_error);
          const errors = [];
          if (has_error) {
            documents.forEach((doc) => {
              if (doc.has_error) {
                errors.push(doc.error)
              }
            });
          }

          rows.push({
            person: person.person,
            delivery_type: (isSC ? DELIVERY_SC : tickets[0].delivery_method),
            documents,
            trsNote: notes.join('+'),
            has_error,
            error: errors.join("\n"),
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
    this.viewRecords.forEach((r) => {
      if (selected) {
        if (!r.has_error) {
          set(r, 'selected', true);
        }
      } else {
        set(r, 'selected', false);
      }
    });
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
    /*   if (isWAPSO) {
         const matches = soname.match(/^\s*([\w-]+)\s*(.*)$/);
         row.first_name = matches[1];
         row.last_name = !isEmpty(matches[2]) ? matches[2] : person.last_name;
       } else */
    row.first_name = person.first_name;
    row.last_name = person.last_name;
    row.full_name = `${person.first_name} ${person.last_name}`;
    row.email = person.email;
    row.project_name = `Ranger ${person.callsign}`;
  }

  get filterLabel() {
    for (const group of this.filterOptions) {
      if (group.options) {
        for (const option of group.options) {
          if (option[1] === this.filter) {
            return option[0];
          }
        }
      } else if (group[1] === this.filter) {
        return group[0];
      }
    }

    return this.filter;
  }

  @action
  exportSelectedAction() {
    const records = this.viewRecords.filter((r) => r.selected);
    this.modal.confirm('Confirm TRS Export',
      `A comment will be added to all exported items indicating who performed the export. Are you sure you want to export ${records.length} items? `,
      () => this._performExport());
  }

  async _performExport() {
    const records = this.viewRecords.filter((r) => r.selected);
    let rows;

    if (!records.length) {
      this.modal.info('No records selected', 'You have not selected any records to export/upload');
      return;
    }

    const exportedIds = [];
    const exportedBy = `exported by CHID #${this.session.user.id}`;

    if (this.filter === STAFF_CREDENTIAL_VP
      || this.filter === GIFT_TICKET_VP
      || this.filter === SPT_VP
      || this.filter === LSD_TICKET_VP) {
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
          note: `${rec.trsNote} ${exportedBy}`,
        };

        this._fillName(person, row, false);
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
          exportedIds.push(doc.id);
        })

        if (docCount) {
          rows.push(row);
        }
      });
    } else {
      rows = records.map((doc) => {
        const person = doc.person;

        const row = {note: `${doc.trsNote} ${exportedBy}`};

        exportedIds.push(doc.id);

        this._fillName(person, row, (doc.type === WAPSO), doc.name);

        const isPostal = (doc.delivery_method === DELIVERY_POSTAL);

        switch (doc.type) {
          case SPT:
          case GIFT_TICKET:
          case VEHICLE_PASS_GIFT:
          case LSD_TICKET:
          case VEHICLE_PASS_LSD:
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

        /*
        if ((doc.type === GIFT_TICKET || doc.type === VEHICLE_PASS) && isPostal) {
          row.address1 = doc.street1;
          row.city = doc.city;
          row.state = doc.state;
          row.zip = doc.postal_code;
          row.phone = isBlank(doc.phone) ? '' : doc.phone;
          row.country = 'US';
        } else {
          this._fillAddress(person, row);
        }*/

        return row;
      });

    }

    let format;

    switch (this.filter) {
      case SPT:
      case SPT_VP:
      case GIFT_TICKET:
      case GIFT_TICKET_VP:
      case VEHICLE_PASS_GIFT:
       case VEHICLE_PASS_LSD:
        format = PAID_EXPORT_FORMAT;
        break;

      case LSD_TICKET:
      case LSD_TICKET_VP:
        format = LSD_EXPORT_FORMAT;
        break;

      default:
        format = UNPAID_EXPORT_FORMAT;
        break;
    }

    const columns = format.map((r) => ({title: r[0], key: r[1]}));

    const date = dayjs().format('YYYY-MM-DD-HH-mm');

    // Mark the records as exported first.
    try {
      await this.ajax.request('access-document/bulk-comment', {
        method: 'POST',
        data: {
          ids: exportedIds,
          comment: 'exported' // Bulk comment API will add the user's callsign and a timestamp
        }
      });
      this.toast.success('An export comment was successfully added to the exported items.');
    } catch (response) {
      this.house.handleErrorResponse(response);
    }

    const contents = this.house.downloadCsv(`trs-${this.filter.replace(/_/g, '-')}-${date}.csv`, columns, rows);

    this.house.actionRecord('access-document-export', {
      ids: exportedIds,
      filter: this.filter,
      contents,
    });
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


    this.modal.confirm('Confirm mask as submitted',
      `Are you sure you want to mark the ${itemCount} item(s) as submitted?`,
      async () => {
        this.isSubmitting = true;
        try {
          await this.ajax.request('access-document/mark-submitted', {method: 'POST', data: {ids}});
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
          })
        } catch (response) {
          this.house.handleErrorResponse(response);
        } finally {
          this.isSubmitting = false;
        }
      });
  }

  @action
  deliveryLabel(row) {
    return DeliveryMethodLabels[row.delivery_type] ?? row.delivery_type;
  }
}
