import ClubhouseController from "clubhouse/controllers/clubhouse-controller";
import {
  STATUS_CREATED,
  STATUS_PENDING,
  STATUS_APPROVED, WHY_VOLUNTEER_REVIEW_PROBLEM, STATUS_APPROVED_PII_ISSUE,
} from "clubhouse/models/prospective-application";
import {cached, tracked} from '@glimmer/tracking';
import {action} from '@ember/object';
import _ from 'lodash';

const statusFilterDescription = {
  pending: 'awaiting V.C. review',
  handles: 'in callsign processing',
  held: 'on hold, awaiting applicant response, RRN reply, or further investigation needed',
  'approved-pii-issues': 'approved, however, Personal Info issues must be resolved first before an account is created.',
  approved: 'approved, callsign assigned, awaiting account creation',
  created: 'application approved, Clubhouse account(s) created',
  rejected: 'rejected due to lack of experience, age, pre-bonk, uber-bonk, is returning Ranger, or is duplicate submission.',
  'why-ranger': 'applications with problematic Why Ranger answers'
};

export default class VcApplicationsIndexController extends ClubhouseController {
  queryParams = ['year'];

  @tracked applications;
  @tracked editApp;

  @tracked assignedToFilter = 'all';
  @tracked VCs;

  @tracked year;

  @tracked nameFilter = 'all';

  @tracked statusFilter = 'pending';

  statusFilterOptions = [
    ['Pending', 'pending'],
    ['Handle Processing', 'handles'],
    ['On Hold', 'held'],
    ['Approved w/PII Issues', 'approved-pii-issues'],
    ['Approved', 'approved'],
    ['Created Accounts', 'created'],
    ['Rejected', 'rejected'],
    ['Why Ranger Problems', 'why-ranger'],
  ];


  get notCurrentYear() {
    return +this.year !== this.house.currentYear();
  }

  get applicationTypeDescription() {
    return statusFilterDescription[this.statusFilter] ?? `Bug: unknown status ${this.statusFilter}`;
  }

  @cached
  get nameFilterList() {
    const list = [];

    const last = {};

    this.applications.forEach((a) => {
      const letter = a.last_name.charAt(0).normalize('NFC').toUpperCase();
      last[letter] = true;
    });

    _.forEach(last, (value, key) => list.push(key));

    list.sort();
    list.unshift(['All', 'all']);
    return list;
  }

  @action
  nameFilterInfo() {
    if (this.nameFilter === 'all') {
      return ''
    }
    return ` with the last name starting with ${this.nameFilter}, `;
  }

  @action
  editAction(app) {
    this.editApp = app;
  }

  @action
  finishEdit() {
    this.editApp = null;
  }

  @cached
  get assignedOptions() {
    return [
      ['All', 'all'],
      ['Unassigned', 'unassigned'],
      {
        groupName: 'Volunteer Coords.',
        options: this.VCs.map((v) => [v.callsign, v.id]),
      }
    ];
  }

  @cached
  get filteredApps() {
    let apps;

    switch (this.statusFilter) {
      case 'pending':
        apps = this.applications.filter((a) => a.status === STATUS_PENDING);
        break;
      case 'handles':
        apps = this.applications.filter((a) => a.isProcessingCallsign);
        break;
      case 'held':
        apps = this.applications.filter((a) => a.hasHeldStatus);
        break;
      case 'approved-pii-issues':
        apps = this.applications.filter((a) => a.status === STATUS_APPROVED_PII_ISSUE);
        break;
      case 'approved':
        apps = this.applications.filter((a) => a.status === STATUS_APPROVED);
        break;
      case 'created':
        apps = this.applications.filter((a) => a.status === STATUS_CREATED);
        break;
      case 'rejected':
        apps = this.applications.filter((a) => a.hasStopStatus);
        break;
      case 'why-ranger':
        apps = this.applications.filter((a) => a.why_volunteer_review === WHY_VOLUNTEER_REVIEW_PROBLEM);
        break;
      default:
        apps = this.applications;
    }

    switch (this.assignedToFilter) {
      case 'all':
        // no change
        break;
      case 'unassigned':
        return apps.filter((a) => !a.assigned_person_id);
      default: {
        const personId = +this.assignedToFilter;
        apps = apps.filter((a) => a.assigned_person_id === personId);
        break;
      }
    }

    if (this.nameFilter === 'all') {
      return apps;
    }

    return apps.filter((a) => a.last_name.charAt(0).normalize('NFC').toUpperCase() === this.nameFilter);
  }

  @cached
  get assignedToCallsign() {
    switch (this.assignedToFilter) {
      case 'unassigned':
        return 'unassigned,';
      case 'all':
        return '';
    }

    const id = +this.assignedToFilter;
    return id ? `assigned to ${this.VCs.find((v) => v.id === id)?.callsign ?? 'Unknown'},` : '';
  }
}
