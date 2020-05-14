import Controller from '@ember/controller';
import EmberObject from '@ember/object';
import {debounce} from '@ember/runloop';
import {action, computed} from '@ember/object';
import {slotSignup} from 'clubhouse/utils/slot-signup';
import _ from 'lodash';

const SEARCH_RATE_MS = 300;

export default class TrainingSlotController extends Controller {
  dirtRankOptions = [
    ["No Rank", ''],
    ["1 - Above Average (Note Required)", 1],
    ["2 - Average", 2],
    ["3 - Below Average (Note Required)", 3],
    ["4 - FLAG (Note Required)", 4]
  ];

  artRankOptions = [
    ["No Rank", ''],
    1, 2, 3,
    ["FLAG", 4]
  ];

  passedOptions = [
    ['Yes', 1],
    ['No or No Show', 0]
  ];

  trainerStatusOptions = [
    ['Pending', 'pending'],
    ['Attended', 'attended'],
    ['No Show', 'no-show'],
  ];

  feedbackDeliveredOptions = [
    ['Yes', 1],
    ['No', 0]
  ];

  showEmails = false;

  // How many people have passed
  @computed('students.[]')
  get passedCount() {
    let passed = 0;
    this.students.forEach((student) => {
      if (student.scored && student.passed) {
        passed++;
      }
    });

    return passed;
  }

  /**
   * Is the user allowed to add a student to the class?
   *
   * For dirt training - only Clubhouse Admins may do so. (per TA 2020 request)
   * For ARTS - any trainer.
   */

  get canAddStudent() {
    return this.training.is_art || this.session.user.isAdmin;
  }

  // How many Dirt Vets (2 or more rangering years) OR
  // ART vets (if not a ART prospective)
  @computed('students.[]', 'training.is_art')
  get vetCount() {
    let vets = 0;
    const is_art = this.training.is_art;

    this.students.forEach((student) => {
      if (is_art) {
        if (!student.is_art_prospective) {
          vets++;
        }
      } else if (student.years > 1) {
        vets++;
      }
    });

    return vets;
  }

  // How many dirt PNV or ART prospectives
  @computed('students.[]', 'training.is_art')
  get prospectiveCount() {
    const is_art = this.training.is_art;
    let prospective = 0;

    this.students.forEach((student) => {
      if (is_art) {
        if (student.is_art_prospective) {
          prospective++;
        }
      } else if (student.status == 'prospective') {
        prospective++;
      }
    });

    return prospective;
  }

  // How many dirt PNV or ART prospectives

  @computed('students.[]')
  get auditorCount() {
    let auditors = 0;

    this.students.forEach((student) => {
      if (student.status == 'auditor') {
        auditors++;
      }
    });

    return auditors;
  }

  @computed('students.[]')
  get firstYearCount() {
    let firstYear = 0;

    this.students.forEach((student) => {
      if (student.years == 1) {
        firstYear++;
      }
    });

    return firstYear;
  }

  get trainerCount() {
    return this.trainers.reduce((total, group) => {
      return group.trainers.length + total;
    }, 0);
  }

  @action
  editStudentAction(student) {
    this.set('editStudent', student);
    this.set('studentForm', {
      rank: student.rank,
      note: '',
      passed: student.passed ? 1 : 0,
      feedback_delivered: student.feedback_delivered ? 1 : 0
    });
  }

  @action
  cancelStudentAction() {
    this.set('editStudent', null);
  }

  // Save the student scores in bulk.
  @action
  saveStudentAction(model) {
    const student = this.editStudent;
    const {rank, note, passed} = model;

    const score = {
      id: student.id,
      note,
      rank: rank !== '' ? +rank : rank,
      passed: +passed ? 1 : 0,
    };

    if (!this.training.is_art) {
      if (!rank && passed && student.need_ranking) {
        model.pushErrors('rank', ['Please enter a rank.']);
        return;
      }

      if ((rank > 0 && rank != 2) && (note == '' && student.notes.length == 0)) {
        model.addError('note', ['A note needs to be entered if a rank is given.']);
        return;
      }

      score.feedback_delivered = model.feedback_delivered ? 1 : 0;
    }

    this.set('isSubmitting', true);

    this.ajax.post(`training-session/${this.slot.id}/score-student`, {
      data: score
    }).then((results) => {
      this.set('editStudent', null);
      this.set('students', results.students);
      this.toast.success(`${student.callsign} was successfully saved.`);
    })
      .catch((response) => this.house.handleErrorResponse(response))
      .finally(() => {
        this.set('isSubmitting', false);
      });
  }

  // Save the student scores in bulk.
  @action
  saveTrainers() {
    const trainers = [];

    this.trainers.forEach((type) => {
      type.trainers.forEach((trainer) => {
        trainers.push({
          id: trainer.id,
          status: trainer.status,
          trainer_slot_id: trainer.trainer_slot_id
        });
      });
    });

    this.toast.clear();
    this.set('isSubmitting', true);
    this.ajax.post(`training-session/${this.slot.id}/trainer-status`, {
      data: {trainers}
    }).then((results) => {
      this.set('trainers', results.trainers);
      this.toast.success('Trainer attendance was successfully updated.');
    })
      .catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.set('isSubmitting', false));
  }

  // Show the dialog to add a person
  @action
  showAddPersonAction() {
    this.set('foundPeople', null);
    this.set('noSearchMatch', null);
    this.set('addPersonForm', EmberObject.create({
      name: ''
    }));
  }

  @action
  searchPeopleAction(field, model) {
    debounce(this, this._performSearch, model, SEARCH_RATE_MS);
  }

  _performSearch(model) {
    const query = model.get('name');

    if (query == '' || query.length < 2) {
      return;
    }

    this.ajax.request('person', {
      data: {
        query,
        basic: 1,
        search_fields: 'name,callsign,email',
        exclude_statuses: 'deceased,dismissed,bonked,retired,uberbonked',
        limit: 10
      }
    }).then((results) => {
      this.set('foundPeople', results.person);
      if (results.person.length == 0) {
        this.set('noSearchMatch', query);
      }
    }).catch((response) => {
      this.house.handleErrorResponse(response);
    })
  }

  @action
  cancelSearchAction() {
    this.set('addPersonForm', null);
  }

  @action
  addPersonAction(person, event) {
    event.preventDefault();
    slotSignup(this, this.slot, person, () => {
      this.set('addPersonForm', null);
      // Refresh the list
      this.ajax.request(`training-session/${this.slot.id}`).then((results) => {
        const student = results.students.find((s) => s.id == person.id);
        if (student) {
          this.students.push(student);
          this.set('students', _.orderBy(this.students, [(s) => s.callsign.toLowerCase()], ['asc']));
        }
      }).catch((response) => this.house.handleErrorResponse(response))
    });
  }

  // Remove a student from the session
  @action
  removeStudentAction() {
    const student = this.editStudent;

    this.modal.confirm('Confirm Student Removal', `Are you really sure you want to remove ${student.callsign} from this session?`, () => {
      this.set('iSubmitting', true);
      this.ajax.delete(`person/${student.id}/schedule/${this.slot.id}`)
        .then((results) => {
          if (results.status == 'success') {
            this.students.removeObject(student);
            this.toast.success(`${student.callsign} was successfully removed from this training session.`);
            this.set('editStudent', null);
          } else {
            this.toast.error(`The server responded with an unknown status code [${results.status}]`);
          }
        })
        .catch((response) => this.house.handleErrorResponse(response))
        .finally(() => this.set('isSubmitting', false));
    });
  }

  // Toggle the email list
  @action
  toggleEmailListAction() {
    this.set('showEmails', !this.showEmails);
  }
}
