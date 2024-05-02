import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {cached, tracked} from '@glimmer/tracking';
import {
  BANKED, CLAIMED,
  GIFT_TICKET,
  LSD_TICKET, QUALIFIED,
  SPT,
  STAFF_CREDENTIAL, SUBMITTED,
  VEHICLE_PASS_SP,
  VEHICLE_PASS_GIFT, VEHICLE_PASS_LSD, WAP, WAPSO
} from "clubhouse/models/access-document";

const CSV_COLUMNS = [
  {title: 'RAD', key: 'rad'},
  {title: 'Person', key: 'callsign'},
  {title: 'Type', key: 'type'},
  {title: 'Arrival', key: 'arrival'},
  {title: 'S.O. Name', key: 'name'},
  {title: 'Source Year', key: 'source_year'},
  {title: 'Expires', key: 'expires'},
  {title: 'Comments', key: 'comments'},
];

export default class VcAccessDocumentsIndexController extends ClubhouseController {
  @tracked summaryDocuments;
  @tracked accessDocuments;
  @tracked filterStatus = 'all';
  @tracked filterType = 'all';
  @tracked isLoading = false;

  typeOptions = [
    ['All', 'all'],
    {
      groupName: 'Regular Items',
      options: [
        ["Special Price Ticket", SPT],
        ["Staff Credential", STAFF_CREDENTIAL],
        ["Setup Access Pass", WAP],
        ["S.O. Setup Access Pass", WAPSO],
        ['Vehicle Pass (Gift)', VEHICLE_PASS_GIFT],
        ['Vehicle Pass (Special Price)', VEHICLE_PASS_SP],
      ]
    },
    {
      groupName: 'Gift Items',
      options: [
        ["Gift Ticket", GIFT_TICKET],
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
    ["All", 'all'],
    ["Banked", BANKED],
    ["Claimed", CLAIMED],
    ["Qualified", QUALIFIED],
    ["Submitted", SUBMITTED],
  ];

  @cached
  get viewDocuments() {
    let documents = this.accessDocuments;

    if (this.filterType !== 'all') {
      documents = documents.filter((d) => d.type === this.filterType);
    }

    if (this.filterStatus !== 'all') {
      documents = documents.filter((d) => d.status === this.filterStatus);
    }

    return documents;
  }

  @action
  async changeTabs(newId) {
    if (newId !== 'records') {
      return;
    }

    this.isLoading = true;
    try {
      this.accessDocuments = await this.store.query('access-document', {include_person: 1});
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isLoading = false;
    }
  }

  @action
  exportToCSV() {
    const rows = this.viewDocuments.map((row) => ({
      rad: `RAD-${row.id}`,
      callsign: row.person.callsign,
      type: row.typeLabel,
      arrival: (row.isWAP || row.isWAPSO || row.isStaffCredential) ? row.admission_date : '',
      name: row.isWAPSO ? row.name : '',
      source_year: row.source_year,
      expires: row.expiry_year,
      comments: row.comments,
    }));

    this.house.downloadCsv(`${this.house.currentYear()}-access-documents.csv`, CSV_COLUMNS, rows);
  }
}
