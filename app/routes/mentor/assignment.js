import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import RSVP from 'rsvp';
import {tracked} from '@glimmer/tracking';
import dayjs from 'dayjs';
import _ from 'lodash';

const MENTOR_COUNT = 3;

const SHIFT_FORMAT = 'ddd MMM DD [@] HH:mm';

class Mentor {
  @tracked mentor_id;
  @tracked person_mentor_id;

  constructor(mentorId = null, personMentorId = null) {
    this.mentor_id = mentorId;
    this.person_mentor_id = personMentorId;
  }
}

class Alpha {
  @tracked error;
  @tracked mentors;
  @tracked selected;
  @tracked mentor_status;

  constructor(person) {
    Object.assign(this, person);
  }
}

export default class MentorAssignmentRoute extends ClubhouseRoute {
  async model() {
    return {
      alphas: await this.ajax.request('mentor/alphas').then((result) => result.alphas),
      mentors: await this.ajax.request('mentor/mentors').then((result) => result.mentors)
    };
  }

  setupController(controller, model) {
    const year = this.house.currentYear();

    /*
     * Run thru the alphas and find the current mentor assignments
     */

    const shifts = {}, walking = {}, walkingUnknown = [];

    const alphas = model.alphas.map((person) => {
      const current = person.mentor_history.find((history) => history.year === year);
      const mentors = [];

      if (current) {
        person.mentor_status = current.status;
        current.mentors.forEach((mentor) => {
          mentors.push(new Mentor(mentor.id, mentor.person_mentor_id));
        });
        // remove the current mentor, so it does not appear in the prior list
        _.pull(person.mentor_history, current);
      } else {
        person.mentor_status = 'pending';
      }

      // Pad out the mentor list
      for (let i = mentors.length; i < MENTOR_COUNT; i++) {
        mentors.push(new Mentor);
      }

      person.mentors = mentors;
      person.error = null;

      if (person.alpha_slots) {
        person.alpha_slots.forEach((slot) => shifts[slot.begins] = true)
      }

      const onDuty = person.on_alpha_shift;
      if (onDuty) {
        if (onDuty.begins) {
          walking[onDuty.begins] = true;
        } else {
          walkingUnknown.push(person);
        }
      }
      return new Alpha(person);
    });

    let walkingOptions = Object.keys(walking).sort().map((shift) => [dayjs(shift).format(SHIFT_FORMAT), 'onduty-' + shift]);
    if (walkingOptions.length) {
      walkingOptions.unshift({label: 'All Checked-In', value: 'onduty-all'});
    } else {
      walkingOptions.unshift({label: 'No Check-Ins Found', value: 'no-checkins', disabled: true});
    }

    let shiftOptions = Object.keys(shifts).sort().map((shift) => [dayjs(shift).format(SHIFT_FORMAT), shift]);

    controller.shiftFilterOptions = [
      ['All', 'all'],
      ['Not Checked In', 'not-checked-in'],
      {
        groupName: 'Checked Into Shifts',
        options: walkingOptions,
      },
      {
        groupName: 'Signed-Up For Shifts',
        options: shiftOptions,
      },
    ];

    controller.walkingUnknown = walkingUnknown;

    controller.alphas = alphas;
    controller.mentors = model.mentors;
    controller.year = year;
    controller.filter = 'all';
    controller.isPrinting = false;
    controller.shiftFilter = 'all';

    controller.selectAll = false;
  }
}
