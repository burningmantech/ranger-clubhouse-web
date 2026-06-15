import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action, set} from '@ember/object';
import {isBlank} from '@ember/utils';
import dayjs from 'dayjs';
import {cached, tracked} from '@glimmer/tracking';
import {
  DELIVERY_SC,
  GIFT_TICKET,
  LSD_TICKET,
  SPT,
  STAFF_CREDENTIAL,
  VEHICLE_PASS_SP,
  VEHICLE_PASS_GIFT,
  VEHICLE_PASS_LSD,
  WAP,
  WAPSO,
  TypeShortLabels, DeliveryMethodLabels
} from 'clubhouse/models/access-document';
import {ALPHA, PROSPECTIVE} from 'clubhouse/constants/person_status';
import {
  STAFF_CREDENTIAL_VP,
  SPT_VP,
  GIFT_TICKET_VP,
  LSD_TICKET_VP,
  trsColumnAndDate,
  deliveryTypeForDocument,
  combinedDeliveryType,
  exportColumns,
} from 'clubhouse/utils/access-document-export';

// Filter Options
const WAP_ALL = 'work_access_pass_all';
const WAP_PNV = 'work_access_pass_pnv';
const WAP_RANGER = 'work_access_pass_ranger';
const WAP_RANGER_PLUS_SO = 'work_access_pass_ranger_plus_so';

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
          ['Staff Credentials + Gift VPs (must have both)', STAFF_CREDENTIAL_VP],
          ['Gift Vehicle Passes', VEHICLE_PASS_GIFT],
        ]
    },
    {
      groupName: 'Special Price',
      options:
        [
          ['SP Tickets + SP VPs (must have both)', SPT_VP],
          ['Special Price Tickets', SPT],
          ['SP Vehicle Passes', VEHICLE_PASS_SP],
        ]
    },
    {
      groupName: 'Setup Access Passes',
      options:
        [
          ['SAP Ranger', WAP_RANGER],
          ['SAP Ranger + Significant Other', WAP_RANGER_PLUS_SO],
          ['SAP Significant Other', WAPSO],
          ['SAP Prospective / Alpha', WAP_PNV],
          ['SAP All', WAP_ALL],
        ]
    },
    {
      groupName: 'Other Tickets',
      options: [
        ['Gift Tickets', GIFT_TICKET],
        ['LSD Tickets', LSD_TICKET],
        ['LSD Tickets + LSD VP (must have both)', LSD_TICKET_VP],
        ['LSD Vehicle Passes', VEHICLE_PASS_LSD],
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
        const {trsColumn, dateInfo} = trsColumnAndDate(doc);

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

      case WAP_RANGER_PLUS_SO:
        return this.accessDocuments.filter((r) => (r.type === WAP || r.type === WAPSO) && r.person.status !== ALPHA && r.person.status !== PROSPECTIVE);

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
          vpType = VEHICLE_PASS_GIFT;
        } else if (filter === SPT_VP) {
          ticketType = SPT;
          vpType = VEHICLE_PASS_SP;
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
      || this.filter === SPT_VP
      || this.filter === LSD_TICKET_VP) {
      rows = [];
      records.forEach((rec) => {
        const {person, documents} = rec;
        const delivery_type = combinedDeliveryType(this.filter, documents);

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

        row.delivery_type = deliveryTypeForDocument(doc);

        row[doc.trsColumn] = 1;

        return row;
      });

    }

    const columns = exportColumns(this.filter);

    const date = dayjs().format('YYYY-MM-DD-HH-mm');

    // Mark the records as exported first.
    try {
      await this.ajax.post('access-document/bulk-comment', {
        data: {
          ids: exportedIds,
          comment: `exported with filter ${this.filter}` // Bulk comment API will add the user's callsign and a timestamp
        }
      });
      this.toast.success('An export comment was successfully added to the exported items.');
    } catch (response) {
      this.errors.handleErrorResponse(response);
    }

    const contents = this.download.downloadCsv(`trs-${this.filter.replace(/_/g, '-')}-${date}.csv`, columns, rows);

    this.analytics.actionRecord('access-document-export', {
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
          await this.ajax.post('access-document/mark-submitted', {data: {ids}});
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
          this.errors.handleErrorResponse(response);
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
