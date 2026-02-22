import ClubhouseController from "clubhouse/controllers/clubhouse-controller";
import {
  StatusOptions,
  StatusLabels,
  STATUS_PENDING,
  STATUS_HANDLE_CHECK,
  STATUS_HOLD_MORE_HANDLES,
  STATUS_APPROVED,
  STATUS_CREATED,
} from "clubhouse/models/prospective-application";
import {cached, tracked} from '@glimmer/tracking';
import {action} from '@ember/object';
import _, {isEmpty} from 'lodash';

export const FILTERS_KEY = 'prospective-application-filters';
export const FILTERS_VALUES = {
  ageFilter: 'all',
  assignedToFilter: 'all',
  experienceFilter: 'all',
  nameFilter: 'all',
  statusFilter: STATUS_PENDING,
};

export default class VcApplicationsIndexController extends ClubhouseController {
  queryParams = ['year'];

  @tracked applications;
  @tracked editApp;

  @tracked ageFilter;
  @tracked assignedToFilter;
  @tracked experienceFilter;
  @tracked nameFilter;
  @tracked statusFilter;

  @tracked VCs;
  @tracked year;

  @tracked activePreset = null;

  statusFilterOptions = [
    ['All', 'all'],
    ...StatusOptions
  ];

  ageFilterOptions = [
    ['All', 'all'],
    ['Is >= 18', 'over-18'],
    ['Is < 18 ', 'young']
  ];

  experienceFilterOptions = [
    ['All', 'all'],
    ['Qualified', 'qualified'],
    ['Unqualified', 'unqualified'],
  ];

  get notCurrentYear() {
    return +this.year !== this.house.currentYear();
  }

  get applicationTypeDescription() {
    if (this.statusFilter === 'all') {
      return 'all statuses';
    }
    if (this.statusFilter === '_held') {
      return 'on hold';
    }
    if (this.statusFilter === '_rejected') {
      return 'rejected';
    }
    if (this.statusFilter === '_callsign') {
      return 'callsign processing';
    }
    return StatusLabels[this.statusFilter] ?? `Bug: unknown status ${this.statusFilter}`;
  }

  @cached
  get statusGroups() {
    const apps = this.applications;
    if (!apps) {
      return [];
    }

    const counts = {
      pending: 0,
      callsign: 0,
      held: 0,
      approved: 0,
      created: 0,
      rejected: 0,
    };

    apps.forEach((a) => {
      switch (true) {
        case a.status === STATUS_PENDING:
          counts.pending++;
          break;
        case a.status === STATUS_HANDLE_CHECK || a.status === STATUS_HOLD_MORE_HANDLES:
          counts.callsign++;
          break;
        case a.hasHeldStatus && a.status !== STATUS_HOLD_MORE_HANDLES:
          counts.held++;
          break;
        case a.status === STATUS_APPROVED:
          counts.approved++;
          break;
        case a.status === STATUS_CREATED:
          counts.created++;
          break;
        case a.hasStopStatus:
          counts.rejected++;
          break;
      }
    });

    return [
      {label: 'Pending', count: counts.pending, icon: 'clock', colorClass: 'text-info', filterValue: STATUS_PENDING},
      {label: 'Callsign', count: counts.callsign, icon: 'id-badge', colorClass: 'text-secondary', filterValue: '_callsign'},
      {label: 'On Hold', count: counts.held, icon: 'pause-circle', colorClass: 'text-warning', filterValue: '_held'},
      {label: 'Approved', count: counts.approved, icon: 'thumbs-up', colorClass: 'text-success', filterValue: STATUS_APPROVED},
      {label: 'Created', count: counts.created, icon: 'user-check', colorClass: 'text-success', filterValue: STATUS_CREATED},
      {label: 'Rejected', count: counts.rejected, icon: 'ban', colorClass: 'text-danger', filterValue: '_rejected'},
    ];
  }

  @action
  applyDashboardFilter(filterValue) {
    // If already active, toggle off to show all
    if (this.statusFilter === filterValue) {
      this.setFilter('statusFilter', 'all');
    } else {
      this.setFilter('statusFilter', filterValue);
    }
    this.activePreset = null;
  }

  @action
  applyPreset(presetName) {
    this.activePreset = presetName;
    const userId = this.session.userId;
    const values = this.house.getKey(FILTERS_KEY) || {};

    // Reset all filters first
    this.ageFilter = 'all';
    this.experienceFilter = 'all';
    this.nameFilter = 'all';

    switch (presetName) {
      case 'my-queue':
        this.statusFilter = STATUS_PENDING;
        this.assignedToFilter = String(userId);
        break;
      case 'needs-triage':
        this.statusFilter = STATUS_PENDING;
        this.assignedToFilter = 'unassigned';
        break;
      case 'awaiting-response':
        this.statusFilter = '_held';
        this.assignedToFilter = String(userId);
        break;
      case 'ready-for-callsign':
        this.statusFilter = STATUS_PENDING;
        this.assignedToFilter = 'all';
        this.experienceFilter = 'qualified';
        break;
      case 'why-ranger-issues':
        this.statusFilter = 'all';
        this.assignedToFilter = 'all';
        break;
    }

    // Persist all filter values
    Object.keys(FILTERS_VALUES).forEach((key) => {
      values[key] = this[key];
    });
    this.house.setKey(FILTERS_KEY, values);
  }

  @action
  setFilter(filter, value) {
    const values = this.house.getKey(FILTERS_KEY) || {};
    values[filter] = value;
    this.house.setKey(FILTERS_KEY, values);
    this[filter] = value;
    this.activePreset = null;
  }

  @action
  resetFilters() {
    this.ageFilter = 'all';
    this.assignedToFilter = 'all';
    this.experienceFilter = 'all';
    this.nameFilter = 'all';
    this.statusFilter = 'pending';
    this.activePreset = null;
    this.toast.success('Filters have been reset.');
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

  @cached
  get nameFilterInfo() {
    if (this.nameFilter === 'all') {
      return ''
    }
    return `w/last name starting with ${this.nameFilter}`;
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
      case 'all':
        apps = this.applications;
        break;
      case '_callsign':
        apps = this.applications.filter((a) => a.status === STATUS_HANDLE_CHECK || a.status === STATUS_HOLD_MORE_HANDLES);
        break;
      case '_held':
        apps = this.applications.filter((a) => a.hasHeldStatus && a.status !== STATUS_HOLD_MORE_HANDLES);
        break;
      case '_rejected':
        apps = this.applications.filter((a) => a.hasStopStatus);
        break;
      default:
        apps = this.applications.filter((a) => a.status === this.statusFilter);
        break;
    }

    switch (this.assignedToFilter) {
      case 'all':
        // no change
        break;
      case 'unassigned':
        apps = apps.filter((a) => !a.assigned_person_id);
        break;
      default: {
        const personId = +this.assignedToFilter;
        apps = apps.filter((a) => a.assigned_person_id === personId);
        break;
      }
    }

    switch (this.ageFilter) {
      case 'over-18':
        apps = apps.filter((a) => a.is_over_18);
        break;
      case 'young':
        apps = apps.filter((a) => !a.is_over_18);
        break;
    }

    switch (this.experienceFilter) {
      case 'qualified':
        apps = apps.filter((a) => a.isBRCExperienceOkay);
        break;

      case 'unqualified':
        apps = apps.filter((a) => !a.isBRCExperienceOkay);
        break;
    }

    if (this.nameFilter !== 'all') {
      apps = apps.filter((a) => a.last_name.charAt(0).normalize('NFC').toUpperCase() === this.nameFilter);
    }

    // Sort by staleness: oldest-updated first, nulls first
    apps = [...apps].sort((a, b) => {
      const aDate = a.updated_by_person_at;
      const bDate = b.updated_by_person_at;
      if (!aDate && !bDate) return 0;
      if (!aDate) return -1;
      if (!bDate) return 1;
      return aDate < bDate ? -1 : aDate > bDate ? 1 : 0;
    });

    return apps;
  }

  get assignedToCallsign() {
    switch (this.assignedToFilter) {
      case 'unassigned':
        return 'Unsigned';
      case 'all':
        return '';
    }

    const id = +this.assignedToFilter;
    return id ? `assigned to ${this.VCs.find((v) => v.id === id)?.callsign ?? 'Unknown'}` : '';
  }

  get ageFilterInfo() {
    if (this.ageFilter === 'all') {
      return '';
    }

    return this.ageFilter === 'young' ? '< 18 yrs' : '>= 18 yrs';
  }

  get experienceFilterInfo() {
    if (this.experienceFilter === 'all') {
      return '';
    }

    return this.experienceFilter === 'qualified' ? 'event qualified' : 'event NOT qualified';
  }

  @cached
  get filterInfo() {
    const filtered = [
      this.applicationTypeDescription,
      this.assignedToCallsign,
      this.nameFilterInfo,
      this.experienceFilterInfo,
      this.ageFilterInfo,
    ];

    return filtered.filter((f) => !isEmpty(f)).join(' AND ');
  }

  get callsignLetter() {
    return this.session.user.callsign.charAt(0);
  }
}
