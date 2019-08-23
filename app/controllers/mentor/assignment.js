import Controller from '@ember/controller';
import { action, computed, set} from '@ember/object';
import { isEmpty } from '@ember/utils'

export default class MentorAssignmentController extends Controller {
  statusOptions = [
    'pending',
    'pass',
    'bonk',
    'self-bonk'
  ];

  filterOptions = [
    [ 'All', 'all' ],
    [ 'On Alpha Shift', 'signed-in' ]
  ];

  @computed('mentors')
  get mentorOptions() {
    const options =  this.mentors.map((mentor) => [ mentor.callsign, mentor.id ]);
    options.unshift([ '-', '']);

    return options;
  }

  @computed('alphas', 'filter')
  get viewAlphas() {
    const alphas = this.alphas, filter = this.filter;

    if (filter == 'signed-in') {
      return alphas.filter((a) => a.on_alpha_shift);
    }

    return alphas;
  }

  @action
  saveAlphas() {
    const assignments = [];
    let haveErrors = false;

    this.alphas.forEach((person) => {
      const mentors = [];

      person.mentors.forEach((mentor) => {
        if (isEmpty(mentor.mentor_id)) {
          if (mentor.person_mentor_id) {
            haveErrors = true;
            this.toast.error(`${person.callsign} cannot blank previously assigned mentor`);
          }
        } else {
          const assignment = { mentor_id: mentor.mentor_id };
          if (mentor.person_mentor_id) {
            assignment.person_mentor_id = mentor.person_mentor_id;
          }

          mentors.push(assignment);
        }
      });


      if (mentors.length > 0) {
        assignments.push({
          person_id: person.id,
          status: person.mentor_status,
          mentors
        });
      }

      // Check for duplicate assignment
      const guides = person.mentors;
      if ((guides[0].mentor_id && (guides[0].mentor_id == guides[1].mentor_id || guides[0].mentor_id == guides[2].mentor_id))
        || (guides[1].mentor_id && guides[1].mentor_id == guides[2].mentor_id)) {
          haveErrors = true;
          this.toast.error(`${person.callsign} has duplicate mentor assignments`);
        }
    });

    if (haveErrors) {
      return;
    }

    if (!assignments.length) {
      this.modal.info(null, "No alphas/mentor assignments were found. Perhaps you marked a PNV as passed or failed without assigning mentors?");
      return;
    }

    this.set('isSubmitting', true);
    this.ajax.request('mentor/mentor-assignment', { method: 'POST', data: { assignments }}).then((result) => {
      result.assignments.forEach((assignment) => {
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
      this.toast.success('Assignments succesfully saved.');
    }).catch((response) => this.house.handleErrorResponse(response))
    .finally(() => this.set('isSubmitting', false));
  }
}
