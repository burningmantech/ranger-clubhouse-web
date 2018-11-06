import Controller from '@ember/controller';
import { action, computed } from '@ember-decorators/object';
import { A } from '@ember/array';
import moment from 'moment';

const allDays = { id: 'all', title: 'All Days'};
const allPositions = {id: 'all', title: 'All Positions'};
const upcomingShifts = {id: 'upcoming', title: 'Upcoming Shifts'};
const activeShifts = { id: 'active', title: 'Active' };

const reasons = [
    "an internal error has occurred (this shouldn't happen)",
    "you need an approved BMID (lam) photo",
    "you need an approved callsign",
    "you need an approved callsign and an approved BMID (lam) photo",
    "you need to pass the Manual Review",
    "you need an approved BMID (lam) photo and to pass the Manual Review, in that order",
    "you need an approved callsign and to pass the Manual Review",
    "you need an approved callsign, an approved BMID (lam) photo, and to pass the Manual Review",
];

export default class MeScheduleController extends Controller {
  queryParams = [ 'year' ];
  year = null;

  creditsEarned = 0.0;
  filterDay = upcomingShifts;
  filterPosition = allPositions;
  filterActive = activeShifts;

  activeOptions = [
    activeShifts,
    { id: 'not-active', title: 'Inactive'}
  ];

  @computed('slots', 'filterDay', 'filterPosition', 'filterActive')
  get viewSlots() {
    let slots = this.slots;
    const filterDay = this.filterDay;
    const filterPosition = this.filterPosition;

    if (filterPosition && filterPosition.id) {
      if (filterPosition.id != 'all') {
        slots = slots.filterBy('position_id', filterPosition.id);
      }
    }

    if (filterDay && filterDay.id) {
      const day = filterDay.id;

      if (day == 'upcoming') {
        slots = slots.filterBy('has_started', false);
      } else if (day != 'all') {
        slots = slots.filterBy('slotDay', day);
      }
    }

    slots = slots.filterBy('slot_active', (this.filterActive.id == 'active'));

    return slots;
  }

  @computed('viewSlots')
	get slotGroups() {
    const slots = this.viewSlots;
    let groups = A();
    slots.forEach(function(slot) {
      const title = slot.position_title;
      let group = groups.findBy('title', title)

      if (group) {
        group.slots.push(slot);
      } else {
        groups.pushObject({title, position_id: slot.position_id, slots: [slot]});
      }
    });

    return groups.sortBy('title');
  }

  @computed('slots.[]')
	get positionOptions() {
    const unique = this.slots.uniqBy('position_title');

    let options = A();

    unique.forEach(function(position) {
      options.pushObject({id: position.position_id, title: position.position_title});
    });

    options = options.sortBy('title');
    options.unshiftObject(allPositions);
    return options;
  }

  @computed('slots.[]', 'filterPosition')
	get dayOptions() {
    const unique = this.slots.uniqBy('slotDay').mapBy('slotDay');
    const days = A();

    days.pushObject(upcomingShifts);
    days.pushObject(allDays);

    unique.forEach(function(day) {
      days.pushObject({id: day, title: moment(day).format('ddd MMM DD')})
    });

    return days;
  }

  @computed('slots.@each.person_assigned')
	get signedUpSlots() {
    const slots =  this.slots.filterBy('person_assigned', true);
    let prevEndTime = 0, prevSlot = null;

    slots.forEach(function(slot) {
      if (slot.slot_begins_time < prevEndTime) {
        slot.set('is_overlapping', true);
        prevSlot.set('is_overlapping', true);
      } else {
        slot.set('is_overlapping', false);
      }
      prevEndTime = slot.slot_ends_time;
      prevSlot = slot;
    });

    return slots;
  }

  @computed('permission')
  get deniedReason() {
    if (this.person.isPassProspective) {
      return "it looks like you were interested in volunteering with us some time ago but your account isn't in our volunteer intake pipeline for this year";
    }

    const permission = this.permission;
    const reasonIndex = (!permission.manual_review_passed ? 4 : 0)
                      + (!permission.callsign_approved ? 2 : 0)
                      + ((permission.photo_approved != 'approved') ? 1 : 0);
    return reasons[reasonIndex];
  }

  handleJoinResponse(response, slot) {
    const modal = this.modal;
    if (!response.payload) {
      this.house.handleErrorResponse(response);
      return;
    }

    switch (response.payload.status) {
      case 'full':
        modal.info('The shift is full.', 'The shift is at capacity with '+slot.slot_signed_up+' indivduals signed up.');
        break;

      case 'no-slot':
        modal.info('The slot could not be found?', 'The slot '+slot.id+' was not found in the database. This looks like a bug!');
        break;

      case 'no-position':
        modal.info('Position not held', 'You do not hold the position ['+slot.position_title+'] in order to sign up for this shift.');
        break;

      case 'exists':
        modal.info('Already signed up','Huh, looks like you already signed up for the shift.');
        break;

      case 'not-active':
        modal.info('Inactive Shift', 'The shift has not been activated and no signups are not allowed yet. Please check back later and try again.');
        break;

      default:
        this.house.handleErrorResponse(response);
        break;
    }
  }

  joinSlotRequest(slot) {
    const personId = this.person.id;
    const slotId = slot.id;

    this.ajax.request(`person/${personId}/schedule`, {
      method: 'POST',
      data: { slot_id: slotId }
    }).then((response) => {
        slot.set('person_assigned', true);
        slot.set('slot_signed_up', response.signed_up);
        if (response.forced) {
          this.toast.success('Successfully signed up, and the shift is overcapacity. Hope you know what you are doing!');
        } else {
          this.toast.success('Successfully signed up.');
        }
    }).catch((response) => {
      this.handleJoinResponse(response, slot);
    });
  }

  @action
  changeYear(year) {
    this.set('year', year);
  }

  @action
  joinSlot(slot) {
    const isAdmin = this.session.user.isAdmin;
    const title = `${slot.position_title} ${slot.slot_description}`;

    if (slot.has_started && isAdmin) {
      this.modal.confirm(
            `${title} has started`,
            'This shift has already started. Since you are an admin, you may force adding this shift to the schedule. Please confirm you wish to do this.',
            () => { this.joinSlotRequest(slot); });

    } else if (slot.isFull && isAdmin) {
      this.modal.confirm(
            `${title} is full`,
            'Since you are an admin, you may force adding this shift to the schedule. Please confirm you wish to do this.',
            () => { this.joinSlotRequest(slot); });
    } else {
      this.joinSlotRequest(slot);
    }
  }

  @action
  leaveSlot(slot) {
    this.modal.confirm('Confirm Leaving Shift',
      `Are you sure you want to leave the shift "${slot.slot_description}"?`,
      () => {
        const personId = this.person.id;
        const slotId = slot.id;

        this.ajax.request(`person/${personId}/schedule/${slotId}`, {
          method: 'DELETE',
        }).then((result) => {
          slot.set('person_assigned', false);
          slot.set('slot_signed_up', result.signed_up);
          this.toast.success('The shift sign up has been removed.');
        }).catch((response) => { this.house.handleErrorResponse(response); });
      }
    );
  }

  @action
  showPeople(slot) {
    this.ajax.request('slot/' + slot.id + '/people').then((result) => {
      let callsigns = result.people.map((person) => person.callsign );
      if (callsigns.length == 0) {
        callsigns = "No one is signed up for this shift. Be the first!";
      } else {
        callsigns = callsigns.join(', ');
      }
      this.modal.info('Scheduled (Callsigns) for '+slot.slot_description, callsigns);
    }).catch((response) => this.house.handleErrorResponse(response));
  }
}
