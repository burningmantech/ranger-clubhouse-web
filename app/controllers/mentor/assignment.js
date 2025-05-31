import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {isEmpty} from '@ember/utils';
import {cached, tracked} from '@glimmer/tracking';
import {schedule} from '@ember/runloop';
import _ from 'lodash';
import dayjs from 'dayjs';

const SHIFT_FORMAT = 'ddd MMM DD [@] HH:mm';

export default class MentorAssignmentController extends ClubhouseController {
  @tracked isPrinting = false;
  @tracked isSubmitting = false;
  @tracked filter = 'all';
  @tracked isRendering = false;
  @tracked mentors;

  @tracked shiftOptions;
  @tracked shiftFilter;
  @tracked walkingUnknown;

  @tracked checkAll;

  statusOptions = [
    'pending',
    'pass',
    'bonk',
    'self-bonk'
  ];

  filterOptions = [
    ['All', 'all'],
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

  @action
  toggleAll() {
    this.selectAll = !this.selectAll;

    this.viewAlphas.forEach((a) => a.selected = this.selectAll);
  }

  @action
  updateToPassed() {
    this.viewAlphas.forEach((a) => {
      if (a.selected) {
        a.mentor_status = 'pass';
      }
    });
  }

  @cached
  get selectedAlphas() {
    return this.viewAlphas.filter((a) => a.selected).length;
  }

  @cached
  get viewAlphas() {
    let alphas = this.alphas;
    const filter = this.filter;

    switch (filter) {
      case 'pending':
        alphas = alphas.filter((a) => (a.mentor_status === 'pending' && a.mentors[0].mentor_id > 0));
        break;

      case 'passed':
        alphas = alphas.filter((a) => (a.mentor_status === 'pass'));
        break;

      case 'bonked':
        alphas = alphas.filter((a) => (a.mentor_status === 'bonked' || a.mentor_status === 'self-bonk'));
        break;
    }

    switch (this.shiftFilter) {
      case 'all':
        break;

      case 'not-checked-in':
        alphas = alphas.filter((alpha) => !alpha.on_alpha_shift);
        break;

      case 'onduty-all':
        alphas = alphas.filter((alpha) => alpha.on_alpha_shift);
        break;
      default:
        if (this.shiftFilter.startsWith('onduty-')) {
          const begins = this.onDutyDate();
          alphas = alphas.filter((alpha) => alpha.on_alpha_shift?.begins === begins);
        } else {
          alphas = alphas.filter((alpha) => alpha.alpha_slots?.find((s) => s.begins === this.shiftFilter));
        }
        break;
    }

    return alphas;
  }

  @action
  saveAlphas() {
    const assignments = [];
    let errors = 0;

    let bonked = 0, passed = 0;

    this.alphas.forEach((person) => {
      person.error = null;
      const mentors = [];

      person.mentors.forEach((mentor) => {
        if (!isEmpty(mentor.mentor_id)) {
          mentors.push(mentor.mentor_id);
        }
      });

      if (mentors.length > 0) {
        if (person.mentor_status === 'bonk') {
          bonked++;
        } else if (person.mentor_status === 'pass') {
          passed++;
        }
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

    if (passed && !bonked) {
      this.modal.confirm('No Bonks?',
        `You have selected ${passed} passed Alphas, but no bonks were selected. Are you sure everyone passed, and no one was bonked in the selected list?`,
        () => this._runAssignment(assignments));
    } else {
      this._runAssignment(assignments);
    }
  }

  async _runAssignment(assignments) {
    this.isSubmitting = true;
    try {
      const result = await this.ajax.post('mentor/mentor-assignment', {
        data: {assignments, year: this.house.currentYear()}
      });

      result.assignments.forEach((assignment) => {
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
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }

  @action
  updateFilter(value) {
    this.isRendering = true;
    setTimeout(() => {
      this.filter = value;
      setTimeout(() => schedule('afterRender', () => this.isRendering = false), 250);
    }, 100);
  }

  @action
  updateShiftFilter(value) {
    this.isRendering = true;
    setTimeout(() => {
      this.shiftFilter = value;
      setTimeout(() => schedule('afterRender', () => this.isRendering = false), 250);
    }, 100);
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

  @action
  titleLabel() {
    let suffix;

    switch (this.filter) {
      case 'all':
        suffix = 'All Statuses';
        break;
      case 'pending':
        suffix = 'Pending';
        break;
      case 'bonked':
        suffix = 'Bonked';
        break;
      case 'passed':
        suffix = 'Passed';
        break;
    }

    let prefix;
    switch (this.shiftFilter) {
      case 'all':
        prefix = 'All Signed Up For Shifts';
        break;
      case 'not-checked-in':
        prefix = 'NOT CHECKED IN';
        break;
      case 'onduty-all':
        prefix = 'All Checked In';
        break;
      default:
        if (this.shiftFilter.startsWith('onduty-')) {
          prefix = 'Checked In for ' + dayjs(this.onDutyDate()).format(SHIFT_FORMAT);
        } else {
          prefix = 'Signed Up for ' + dayjs(this.shiftFilter).format(SHIFT_FORMAT);
        }
        break;
    }

    if (prefix.length) {
      prefix = ' - ' + prefix;
    }
    return ' - ' + suffix + prefix;
  }

  onDutyDate() {
    return this.shiftFilter.replace(/^(onduty|unknown)-/, '');
  }
}
