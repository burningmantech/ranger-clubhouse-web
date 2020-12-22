import Controller from '@ember/controller';
import { action, set } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { tracked } from '@glimmer/tracking';
import { run } from '@ember/runloop';

export default class MentorAssignmentController extends Controller {
  @tracked isPrinting = false;
  @tracked isSubmitting = false;
  @tracked filter = 'all';

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
    let haveErrors = false;

    this.alphas.forEach((person) => {
      set(person, 'error', null);
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
      if ((guides[0].mentor_id && (guides[0].mentor_id == guides[1].mentor_id || guides[0].mentor_id == guides[2].mentor_id)) ||
        (guides[1].mentor_id && guides[1].mentor_id == guides[2].mentor_id)) {
        haveErrors = true;
        set(person, 'error', `${person.callsign} has duplicate mentor assignments`);
      }
    });

    if (haveErrors) {
      this.toast.error("One or more errors occurred.");
      run.schedule('afterRender', () => {
        this.house.scrollToElement('.is-invalid');
      });

      return;
    }

    if (!assignments.length) {
      this.modal.info(null, "No alphas/mentor assignments were found. Perhaps you marked a PNV as passed or failed without assigning mentors?");
      return;
    }

    this.isSubmitting = true;
    this.ajax.request('mentor/mentor-assignment', { method: 'POST', data: { assignments } }).then(({ assignments }) => {
        assignments.forEach((assignment) => {
          const person = this.alphas.find((p) => assignment.person_id == p.id);

          if (!person) {
            return;
          }

          set(person, 'mentors', assignment.mentors);

          // pad out the mentor assignment
          for (let i = assignment.mentors.length; i < 3; i++) {
            person.mentors.push({ mentor_id: null });
          }

        });
        this.toast.success('Assignments successfully saved.');
        this.house.scrollToTop();
      }).catch((response) => this.house.handleErrorResponse(response))
      .finally(() =>this.isSubmitting = false);
  }

  @action
  togglePrinting() {
    this.isPrinting = !this.isPrinting;
  }
}
