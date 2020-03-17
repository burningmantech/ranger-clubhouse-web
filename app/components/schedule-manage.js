import Component from '@ember/component';
import {action, computed} from '@ember/object';
import {A} from '@ember/array';
import {set} from '@ember/object';
import {Role} from 'clubhouse/constants/roles';
import markSlotsOverlap from 'clubhouse/utils/mark-slots-overlap';
import moment from 'moment';
import {slotSignup} from 'clubhouse/utils/slot-signup';
import {run} from '@ember/runloop';
import $ from 'jquery';

const allDays = ['All Days', 'all'];
const upcomingShifts = ['Upcoming Shifts', 'upcoming'];

export default class ScheduleManageComponent extends Component {
  tagName = '';

  person = null;
  year = null;
  slots = null;
  signedUpSlots = null;
  creditsEarned = 0.0;
  permission = null;
  scheduleSummary = null;

  filterDay = 'upcoming';
  filterActive = 'active';

  requirementsOverride = false;

  activeOptions = [
    ['Active', 'active'],
    ['Inactive', 'inactive'],
    ['All', 'all'],
  ];

  didReceiveAttrs() {
    if (!this.isCurrentYear) {
      this.set('filterDay', 'all');
    }

    this._sortAndMarkSignups();

    this.signedUpSlots.forEach((signedUp) => {
      const slot = this.slots.find((slot) => signedUp.id == slot.id);
      if (slot) {
        slot.set('person_assigned', true);
      }
    });
  }

  _sortAndMarkSignups() {
    this.signedUpSlots.sort((a, b) => a.slot_begins_time - b.slot_begins_time);
    this.signedUpSlots.forEach((slot) => {
      slot.set('is_overlapping', false);
      slot.set('is_training_overlap', false);
    });
    markSlotsOverlap(this.signedUpSlots);
  }

  _retrieveScheduleSummary() {
    this.ajax.request(`person/${this.person.id}/schedule/summary`, {data: {year: this.year}}).then((result) => {
      this.set('scheduleSummary', result.summary);
    }).catch((result) => this.house.handleErrorResponse(result));
  }

  get isCurrentYear() {
    return (this.year == this.house.currentYear())
  }

  get noPermissionToSignUp() {
    return this.isCurrentYear && !this.permission.signup_allowed;
  }

  /*
   * Filter out what the person can actual see based on their roles.
   * TODO Revisit whether everyone should be able to see inactive slots if they choose.
   */
  @computed('slots')
  get availableSlots() {
    // Filter based on roles.
    if (this.person.hasRole(
      [Role.ADMIN, Role.EDIT_SLOTS, Role.GRANT_POSITION, Role.VC, Role.TRAINER, Role.ART_TRAINER])) {
      return this.slots;
    }

    return this.slots.filter((slot) => slot.slot_active);
  }

  @computed('availableSlots')
  get inactiveSlots() {
    return this.availableSlots.filter((slot) => !slot.slot_active);
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
  get slotGroups() {
    const slots = this.viewSlots;
    let groups = A();
    slots.forEach(function (slot) {
      const title = slot.position_title;
      let group = groups.findBy('title', title);

      if (group) {
        group.slots.push(slot);
      } else {
        groups.pushObject({title, position_id: slot.position_id, slots: [slot]});
      }
    });

    return groups.sortBy('title');
  }

  @computed('slots')
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

  @computed('permission')
  get deniedReason() {
    const permission = this.permission;
    const denied = [];

    if (!permission.callsign_approved) {
      denied.push('have an approved callsign');
    }

    if (permission.photo_status != 'approved' && permission.photo_status != 'not-required') {
      denied.push(`have an approved ${this.person.isNonRanger ? 'Clubhouse' : 'BMID (lam)'} photo`);
    }

    if (!permission.online_training_passed) {
      denied.push('complete Online Training');
    }

    if (permission.missing_bpguid) {
      denied.push('link your Clubhouse account to a Burner Profile ID');
    }

    if (permission.missing_behavioral_agreement) {
      denied.push("agree to the Burning Man's Behavioral Standards Agreement");
    }

    if (denied.length == 0) {
      denied.push('Oops! An internal error occured');
    }

    return denied;
  }

  @computed('permission.photo_status')
  get hasApprovedPhoto() {
    const status = this.permission.photo_status;

    return (status == 'approved' || status == 'not-required');
  }

  @computed('person.id')
  get isMe() {
    return this.session.userId == this.person.id;
  }

  @computed('session.user')
  get isAdmin() {
    return this.session.user.isAdmin;
  }

  @action
  setRequirementsOverride() {
    this.set('requirementsOverride', true);
  }

  @action
  joinSlot(slot, event) {
    const row = $(event.target).closest('.schedule-row');
    const currentOffset = row.offset().top - $(document).scrollTop();

    slotSignup(this, slot, this.person, (result) => {
      // Record the original row position on the page

      this.signedUpSlots.pushObject(slot);
      slot.set('person_assigned', true);
      set(this.permission, 'recommend_burn_weekend_shift', result.recommend_burn_weekend_shift);
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

    if (slot.has_started && this.session.user.isAdmin) {
      message = 'The shift has already started. Because you are an admin, you are allowed to removed the shift. '
    } else {
      message = '';
    }

    message += `Are you sure you want to remove "${slot.position_title} - ${slot.slot_description}" from the schedule?`;

    this.modal.confirm('Confirm Leaving Shift',
      message,
      () => {
        set(slot, 'is_submitting', true);
        this.ajax.request(`person/${this.person.id}/schedule/${slot.id}`, {
          method: 'DELETE',
        }).then((result) => {
          set(slot, 'is_submitting', false);
          const signedUp = this.signedUpSlots.find((s) => s.id == slot.id);

          if (row) {
            // Try to keep the page position static. The sign up will be removed
            // from the schedule, the row deleted, and the browser may want
            // to reposition the page.
            run.schedule('afterRender', () => {
              $(document).scrollTop(row.offset().top - currentOffset);
            });
          }

          if (signedUp) {
            this.signedUpSlots.removeObject(signedUp);
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
    this.set('showBehaviorAgreement', true);
  }

  @action
  closeAgreement() {
    this.set('showBehaviorAgreement', false);
  }

  @action
  signAgreement() {
    this.person.set('behavioral_agreement', true);
    this.person.save().then(() => {
      this.toast.success('Your agreement has been succesfully recorded.');
      // Reload the permissions.
      this.ajax.request(`person/${this.person.id}/schedule/permission`, {data: {year: this.year}})
        .then((results) => {
          this.set('permission', results.permission);
          this.set('showBehaviorAgreement', false);
        });
    }).catch((response) => this.house.handleErrorResponse(response));
  }
}
