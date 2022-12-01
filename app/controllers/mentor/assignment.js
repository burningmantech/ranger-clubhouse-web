import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {isEmpty} from '@ember/utils';
import {cached, tracked} from '@glimmer/tracking';
import {later, schedule} from '@ember/runloop';
import _ from 'lodash';

export default class MentorAssignmentController extends ClubhouseController {
  @tracked isPrinting = false;
  @tracked isSubmitting = false;
  @tracked filter = 'all';
  @tracked isRendering = false;
  @tracked mentors;

  statusOptions = [
    'pending',
    'pass',
    'bonk',
    'self-bonk'
  ];

  filterOptions = [
    ['All', 'all'],
    ['On Alpha Shift', 'signed-in'],
    ['Pending w/Mentor assignment', 'pending'],
    ['Passed', 'passed'],
    ['Bonked', 'bonked']
  ];

  @cached
  get mentorsById() {
    return _.keyBy(this.mentors, 'id');
  }

  @cached
  get mentorOptions() {
    const options = this.mentors.map((mentor) => [mentor.callsign, mentor.id]);
    options.unshift(['-', '']);

    return options;
  }

  get viewAlphas() {
    const alphas = this.alphas,
      filter = this.filter;

    switch (filter) {
      case 'signed-in':
        return alphas.filter((a) => a.on_alpha_shift);

      case 'pending':
        return alphas.filter((a) => (a.mentor_status === 'pending' && a.mentors[0].mentor_id > 0));

      case 'passed':
        return alphas.filter((a) => (a.mentor_status === 'pass'));

      case 'bonked':
        return alphas.filter((a) => (a.mentor_status === 'bonked' || a.mentor_status === 'self-bonk'));

      default:
        return alphas;
    }
  }

  @action
  saveAlphas() {
    const assignments = [];
    let errors = 0;

    this.alphas.forEach((person) => {
      person.error = null;
      const mentors = [];

      person.mentors.forEach((mentor) => {
        if (!isEmpty(mentor.mentor_id)) {
          mentors.push(mentor.mentor_id);
        }
      });

      if (mentors.length > 0) {
        assignments.push({
          person_id: person.id,
          status: person.mentor_status,
          mentor_ids: mentors
        });
      }

      // Check for duplicate assignment
      const guides = person.mentors;

      if ((guides[0].mentor_id && (guides[0].mentor_id === guides[1].mentor_id || guides[0].mentor_id === guides[2].mentor_id))
        || (guides[1].mentor_id && guides[1].mentor_id === guides[2].mentor_id)) {
        errors++;
        person.error = `${person.callsign} has duplicate mentor assignments`;
      }
    });

    if (errors) {
      this.toast.error(`${errors} duplicate mentor assignments encountered.`);
      schedule('afterRender', () => {
        this.house.scrollToElement('.is-invalid');
      });

      return;
    }

    if (!assignments.length) {
      this.modal.info(null, "No alphas/mentor assignments were found. Perhaps you marked an Alpha as passed or failed without assigning mentors?");
      return;
    }

    this.isSubmitting = true;
    this.ajax.request('mentor/mentor-assignment', {method: 'POST', data: {assignments}})
      .then(({assignments}) => {
        assignments.forEach((assignment) => {
          const person = this.alphas.find((p) => assignment.person_id === p.id);

          if (!person) {
            return;
          }

          person.mentors = assignment.mentors;

          // pad out the mentor assignment
          for (let i = assignment.mentors.length; i < 3; i++) {
            person.mentors.push({mentor_id: null});
          }

        });
        this.toast.success('Assignments successfully saved.');
        this.house.scrollToTop();
      }).catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.isSubmitting = false);
  }

  @action
  updateFilter(value) {
    this.isRendering = true;
    later(this, () => {
      this.filter = value;
      schedule('afterRender', () => this.isRendering = false);
    }, 500);
  }

  @action
  togglePrinting() {
    this.isPrinting = !this.isPrinting;
  }

  selectClass(person) {
    let name = 'form-select form-select-sm';
    if (!isEmpty(person.error)) {
      name += ' is-invalid';
    }
    return name;
  }

  @action
  mentorName(person, mentorIdx) {
    const id = person.mentors[mentorIdx]?.mentor_id;
    return id ? this.mentorsById[id]?.callsign : '-';
  }

  getMentorId(person, mentorIdx) {
    return person.mentors[mentorIdx]?.mentor_id;
  }

  @action
  setMentorId(person, mentorIdx, mentorId) {
    person.mentors[mentorIdx].mentor_id = mentorId;
  }
}
