import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {cached, tracked} from '@glimmer/tracking';

const SLOT_SIGNUP_COLUMNS = [
  {key: 'description', title: 'Shift Description'},
  {key: 'begins', title: 'From'},
  {key: 'ends', title: 'To'},
  {key: 'active', title: 'Active'},
  {key: 'signups', title: 'Signup Count'},
  {key: 'max', title: 'Max'},
  {key: 'callsigns', title: 'Callsigns'}
];

const CALLSIGN_SIGNUP_COLUMNS = [
  {key: 'callsign', title: 'Callsign'},
  {key: 'first_name', title: 'First Name'},
  {key: 'last_name', title: 'Last Name'},
  {key: 'status', title: 'Status'},
  {key: 'email', title: 'Email'}
]

export default class ReportsScheduleByPositionController extends ClubhouseController {
  queryParams = ['year'];

  @tracked expandAll = false;
  @tracked positions = [];
  @tracked activeFilter = 'active';

  activeOptions = [
    ['Active', 'active'],
    ['Inactive', 'inactive'],
    ['All', 'all']
  ];

  @cached
  get viewPositions() {
    switch (this.activeFilter) {
      case 'all':
        return this.positions;
    }

    const wantActive = (this.activeFilter === 'active') ? 1 : 0;

    const positions = [];
    this.positions.forEach((p) => {
      const slots = p.slots.filter((s) => s.active === wantActive);

      if (!slots.length) {
        return;
      }

      positions.push({
        id: p.id,
        title: p.title,
        active: p.active,
        activeCount: p.activeCount,
        inactiveCount: p.inactiveCount,
        slots: p.slots.filter((s) => s.active === wantActive)
      })
    });

    return positions;
  }

  @cached
  get letterOptions() {
    let letters = {};
    this.viewPositions.forEach((p) => {
      const letter = p.title.charAt(0).toUpperCase();
      if (!letters[letter]) {
        letters[letter] = p.id;
      }
    });

    return Object.keys(letters).sort().map((letter) => {
      return {id: letters[letter], letter};
    });
  }

  @action
  toggleExpandAll() {
    this.expandAll = !this.expandAll;
    this.house.toggleAllAccordions(this.expandAll);
  }

  @action
  scrollToPosition(id, event) {
    event.preventDefault();
    this.house.scrollToElement(`#position-${id}`, true);
  }

  @action
  exportByShift(position) {
    const slots = position.slots.map((s) => ({
      description: s.description,
      begins: s.begins,
      ends: s.ends,
      active: s.active ? 'Y' : 'N',
      signups: s.sign_ups.length,
      max: s.max,
      callsigns: s.sign_ups.map((p) => p.callsign).join(', ')
    }));

    SLOT_SIGNUP_COLUMNS[0].title = `${this.year} ${position.title}`;
    this.house.downloadCsv(`${this.year}-${position.title}-shifts.csv`, SLOT_SIGNUP_COLUMNS, slots);
  }

  @action
  exportByCallsign(position) {
    const callsigns = {};

    position.slots.forEach((slot) => {
      slot.sign_ups.forEach((person) => {
        if (!callsigns[person.id]) {
          callsigns[person.id] = person;
        }
      });
    });

    const rows = [];
    for (const personId in callsigns) {
      rows.push(callsigns[personId]);
    }
    rows.sort((a, b) => a.callsign.localeCompare(b.callsign));
    this.house.downloadCsv(`${this.year}-${position.title}-callsign-signups.csv`, CALLSIGN_SIGNUP_COLUMNS, rows);
  }

}
