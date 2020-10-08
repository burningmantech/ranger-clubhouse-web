import Component from '@glimmer/component';
import {action, computed} from '@ember/object';
import {A} from '@ember/array';
import {set} from '@ember/object';
import {Role} from 'clubhouse/constants/roles';
import markSlotsOverlap from 'clubhouse/utils/mark-slots-overlap';
import moment from 'moment';
import {slotSignup} from 'clubhouse/utils/slot-signup';
import {run} from '@ember/runloop';
import {tracked} from '@glimmer/tracking';
import {inject as service} from '@ember/service';
import $ from 'jquery';

const allDays = ['All Days', 'all'];
const upcomingShifts = ['Upcoming Shifts', 'upcoming'];

export default class ScheduleManageComponent extends Component {
  @service ajax;
  @service modal;
  @service toast;
  @service house;
  @service session;

  @tracked filterDay = 'upcoming';
  @tracked filterActive = 'active';
  @tracked scheduleSummary;
  @tracked requirementsOverride = false;
  @tracked showBehaviorAgreement = false;
  @tracked permission;

  @tracked availableSlots;
  @tracked isCurrentYear;

  activeOptions = [
    ['Active', 'active'],
    ['Inactive', 'inactive'],
    ['All', 'all'],
  ];

  constructor() {
    super(...arguments);

    const person = this.args.person;
    const permission = this.args.permission;

    this.scheduleSummary = this.args.scheduleSummary;
    this._sortAndMarkSignups();

    this.args.signedUpSlots.forEach((signedUp) => {
      const slot = this.args.slots.find((slot) => signedUp.id == slot.id);
      if (slot) {
        slot.set('person_assigned', true);
      }
    });

    /*
     * Filter out what the person can actual see based on their roles.
     * TODO Revisit whether everyone should be able to see inactive slots if they choose.
     */

    if (this.args.person.hasRole(
      [Role.ADMIN, Role.EDIT_SLOTS, Role.GRANT_POSITION, Role.VC, Role.TRAINER, Role.ART_TRAINER])) {
      this.availableSlots = this.args.slots;
    } else {
      this.availableSlots = this.args.slots.filter((slot) => slot.slot_active);
    }

    this.inactiveSlots = this.availableSlots.filter((slot) => !slot.slot_active);
    this.isCurrentYear = (this.args.year == this.house.currentYear());
    if (!this.isCurrentYear) {
      this.filterDay = 'all';
    }


    this.isMe = (this.session.userId == person.id);
    this.isAdmin = this.session.user.isAdmin;
    this.permission = permission;

    this.noPermissionToSignUp = (this.isCurrentYear && !permission.signup_allowed);
    const photoStatus = permission.photo_status;
    this.hasApprovedPhoto = (photoStatus == 'approved' || photoStatus == 'not-required')
  }

  _sortAndMarkSignups() {
    const slots = this.args.signedUpSlots;

    slots.sort((a, b) => a.slot_begins_time - b.slot_begins_time);
    slots.forEach((slot) => {
      slot.set('is_overlapping', false);
      slot.set('is_training_overlap', false);
    });
    markSlotsOverlap(slots);
  }

  _retrieveScheduleSummary() {
    this.ajax.request(`person/${this.args.person.id}/schedule/summary`, {data: {year: this.args.year}})
      .then((result) => this.scheduleSummary = result.summary)
      .catch((result) => this.house.handleErrorResponse(result));
  }

  @computed('availableSlots', 'filterDay', 'filterActive')
  get viewSlots() {
    let slots = this.availableSlots;
    const filterDay = this.filterDay;

    if (filterDay) {
      if (filterDay == 'upcoming') {
        slots = slots.filterBy('has_started', false);
      } else if (filterDay != 'all') {
        slots = slots.filterBy('slotDay', filterDay);
      }
    }
    if (this.filterActive !== 'all') {
      slots = slots.filterBy('slot_active', this.filterActive === 'active');
    }

    return slots;
  }

  @computed('viewSlots')
  get positions() {
    const slots = this.viewSlots;
    const groups = {};
    slots.forEach((slot) => {
      const position_id = slot.position_id;
      const group = groups[position_id];

      if (group) {
        group.slots.push(slot);
      } else {
        groups[position_id] = {title: slot.position_title, position_id, slots: [slot]};
      }
    });

    return Object.values(groups).sort((a,b) => a.title.localeCompare(b.title));
  }

  @computed('availableSlots', 'slots', 'isCurrentYear')
  get dayOptions() {
    const unique = this.availableSlots.uniqBy('slotDay').mapBy('slotDay');
    const days = A();

    unique.sort((a, b) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });

    if (this.isCurrentYear) {
      days.pushObject(upcomingShifts);
    }

    days.pushObject(allDays);

    unique.forEach(function (day) {
      days.pushObject([moment(day).format('ddd MMM DD'), day])
    });

    return days;
  }

  @action
  setRequirementsOverride() {
    this.requirementsOverride = true;
  }

  @action
  joinSlot(slot, event) {
    const row = $(event.target).closest('.schedule-row');
    const currentOffset = row.offset().top - $(document).scrollTop();

    slotSignup(this, slot, this.args.person, (result) => {
      // Record the original row position on the page

      this.args.signedUpSlots.pushObject(slot);
      slot.set('person_assigned', true);
      this.permission = {...this.permission, recommend_burn_weekend_shift: result.recommend_burn_weekend_shift};
      this._sortAndMarkSignups();
      this._retrieveScheduleSummary();

      // And reposition the page so things appear not to move when the sign up is added
      // to the schedule.
      run.schedule('afterRender', () => {
        $(document).scrollTop(row.offset().top - currentOffset);
      });
    });
  }

  @action
  leaveSlot(slot, event) {
    let message, row = null, currentOffset = 0;

    if (event) {
      row = $(event.target).closest('.schedule-row');
      currentOffset = row.offset().top - $(document).scrollTop();
    }

    if (slot.has_started && this.isAdmin) {
      message = 'The shift has already started. Because you are an admin, you are allowed to removed the shift. '
    } else {
      message = '';
    }

    message += `Are you sure you want to remove "${slot.position_title} - ${slot.slot_description}" from the schedule?`;

    this.modal.confirm('Confirm Leaving Shift',
      message,
      () => {
        set(slot, 'is_submitting', true);
        this.ajax.request(`person/${this.args.person.id}/schedule/${slot.id}`, {
          method: 'DELETE',
        }).then((result) => {
          set(slot, 'is_submitting', false);
          const signedUp = this.args.signedUpSlots.find((s) => s.id == slot.id);

          if (row) {
            // Try to keep the page position static. The sign up will be removed
            // from the schedule, the row deleted, and the browser may want
            // to reposition the page.
            run.schedule('afterRender', () => {
              $(document).scrollTop(row.offset().top - currentOffset);
            });
          }

          if (signedUp) {
            this.args.signedUpSlots.removeObject(signedUp);
            this._sortAndMarkSignups();
          }

          slot.set('person_assigned', false);
          slot.set('slot_signed_up', result.signed_up);
          set(this.permission, 'recommend_burn_weekend_shift', result.recommend_burn_weekend_shift);
          this._retrieveScheduleSummary();
          this.toast.success('The shift has been removed from the schedule.');
        }).catch((response) => {
          set(slot, 'is_submitting', false);
          this.house.handleErrorResponse(response);
        });
      }
    );
  }

  @action
  showPeople(slot) {
    set(slot, 'is_retrieving_people', true);
    this.ajax.request('slot/' + slot.id + '/people').then((result) => {
      let callsigns = result.people.map((person) => person.callsign);
      if (callsigns.length == 0) {
        callsigns = "No one is signed up for this shift. Be the first!";
      } else {
        callsigns = callsigns.join(', ');
      }
      this.modal.info('Scheduled (Callsigns) for ' + slot.slot_description, callsigns);
    })
      .catch((response) => this.house.handleErrorResponse(response))
      .finally(() => set(slot, 'is_retrieving_people', false));
  }

  @action
  toggleGroup(group, event) {
    event.preventDefault();
    set(group, 'show', !group.show);
  }

  @action
  showBehaviorAgreementAction() {
    this.showBehaviorAgreement = true;
  }

  @action
  closeAgreement() {
    this.showBehaviorAgreement = false;
  }

  @action
  signAgreement() {
    const person = this.args.person;

    person.behavioral_agreement = true;
    person.save().then(() => {
      this.toast.success('Your agreement has been successfully recorded.');
      // Reload the permissions.
      this.ajax.request(`person/${person.id}/schedule/permission`, {data: {year: this.args.year}})
        .then((results) => {
          this.permission = results.permission;
          this.showBehaviorAgreement = false;
        });
    }).catch((response) => this.house.handleErrorResponse(response));
  }
}
