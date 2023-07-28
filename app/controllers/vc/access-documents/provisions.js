import ClubhouseController from "clubhouse/controllers/clubhouse-controller";
import {cached, tracked} from '@glimmer/tracking';
import {action} from '@ember/object';
import {AVAILABLE, CLAIMED, BANKED, SUBMITTED, TypeOptions, TypeLabels} from "clubhouse/models/provision";

const TYPE_OPTIONS_WITH_ALL = [...TypeOptions];
TYPE_OPTIONS_WITH_ALL.unshift(['All', 'all']);

const CSV_COLUMNS = [
  {title: 'Provision ID', key: 'id'},
  {title: 'Person', key: 'callsign'},
  {title: 'Type', key: 'type'},
  {title: 'Status', key: 'status'},
  {title: 'Item Count', key: 'item_count'},
  {title: 'Allocated?', key: 'is_allocated', yesno: true},
  {title: 'Source Year', key: 'source_year'},
];

export default class VcAccessDocumentsProvisionsController extends ClubhouseController {
  @tracked typeFilter;
  @tracked statusFilter;
  @tracked allocatedFilter;

  @tracked provisions;

  typeOptions = TYPE_OPTIONS_WITH_ALL;

  statusOptions = [
    ["Current", 'all'],
    ["Available", AVAILABLE],
    ["Banked", BANKED],
    ["Claimed", CLAIMED],
    ["Submitted", SUBMITTED],
  ];

  allocatedOptions = [
    ['All', 'all'],
    ['Allocated', 1],
    ['Not Allocated', 0]
  ];

  @cached
  get viewProvisions() {
    let {provisions} = this;

    if (this.typeFilter !== 'all') {
      provisions = provisions.filter((p) => p.type === this.typeFilter);
    }

    if (this.statusFilter !== 'all') {
      provisions = provisions.filter((p) => p.status === this.statusFilter);
    }

    if (this.allocatedFilter !== 'all') {
      const is_allocated = !!(+this.allocatedFilter);
      provisions = provisions.filter((p) => p.is_allocated === is_allocated);
    }

    return provisions;
  }

  @action
  typeLabel(type) {
    return TypeLabels[type] ?? type;
  }

  @action
  exportToCSV() {
    const rows = this.viewProvisions.map((p) => ({
      id: `RP-${p.id}`,
      callsign: p.person.callsign,
      type: this.typeLabel(p.type),
      status: p.status,
      is_allocated: p.is_allocated,
      item_count: p.item_count > 0 ? p.item_count : '',
      source_year: p.source_year
    }));

    this.house.downloadCsv(`${this.house.currentYear()}-current-provisions.csv`, CSV_COLUMNS, rows);
  }
}
