import Component from '@ember/component';
import { action, computed } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';
import { A } from '@ember/array';
import markSlotsOverlap from 'clubhouse/utils/mark-slots-overlap';
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


export default class ScheduleManageComponent extends Component {
  @argument person;
  @argument year;
  @argument slots;
  @argument creditsEarned;
  @argument permission;

  creditsEarned = 0.0;
  filterDay = upcomingShifts;
  filterPosition = allPositions;
  filterActive = activeShifts;

  activeOptions = [
    activeShifts,
    { id: 'not-active', title: 'Inactive'}
  ];

  didReceiveAttrs() {
    this.set('filterDay', this.isCurrentYear ? upcomingShifts : allDays);
  }

  @computed('year')
  get isCurrentYear() {
    return (this.year == (new Date()).getFullYear())
  }

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

    return slots.filterBy('slot_active', (this.filterActive.id == 'active'));
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

    if (this.isCurrentYear) {
      days.pushObject(upcomingShifts);
    }

    days.pushObject(allDays);

    unique.forEach(function(day) {
      days.pushObject({id: day, title: moment(day).format('ddd MMM DD')})
    });

    return days;
  }

  @computed('slots.@each.person_assigned')
  get signedUpSlots() {
    const slots = this.slots.filterBy('person_assigned', true);
    markSlotsOverlap(slots);
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

  handleErrorJoinResponse(result, slot) {
    const modal = this.modal;
    const status = result.status;

    switch (status) {
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

      case 'multiple-enrollment':
        modal.open(
          'modal-multiple-enrollment', 'Multiple Enrollments Not Allowed',
          { slots: result.slots, is_me: (this.person.id == this.session.user.id ) }
        );
        break;

      default:
        modal.info('Unknown status response', `Sorry, I did not understand the status response of [${status}] from the server`);
        break;
    }
  }

  joinSlotRequest(slot) {
    const personId = this.person.id;
    const slotId = slot.id;
    const isMe = (personId == this.session.user.id);

    this.ajax.request(`person/${personId}/schedule`, {
      method: 'POST',
      data: { slot_id: slotId }
    }).then((result) => {
        if (result.status == 'success') {
          slot.set('person_assigned', true);
          slot.set('slot_signed_up', result.signed_up);
          if (result.full_forced) {
              this.toast.success('Successfully signed up, and the shift is overcapacity. Hope you know what you are doing!');
          } else if (result.trainer_forced) {
            this.toast.success('Successfully signed up, and the trainer is now signed up for multiple training sessions.');
          } else if (result.multiple_forced) {
            this.modal.open('modal-multiple-enrollment', 'Sign Up Forced - Other Enrollments Found',
              {
                slots: result.slots,
                isMe,
                forced: true,
              });
          } else {
            this.toast.success('Successfully signed up.');
          }
        } else {
          this.handleErrorJoinResponse(result, slot);
        }
    }).catch((response) => {
      this.house.handleErrorResponse(response);
    });
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
          this.toast.success('The shift as been removed from the schedule.');
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
