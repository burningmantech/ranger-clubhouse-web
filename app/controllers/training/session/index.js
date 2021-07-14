import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import EmberObject from '@ember/object';
import {debounce} from '@ember/runloop';
import {action, set} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {slotSignup} from 'clubhouse/utils/slot-signup';
import _ from 'lodash';
import dayjs from 'dayjs';

const SEARCH_RATE_MS = 300;

export default class TrainingSlotController extends ClubhouseController {
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

  @tracked students;
  @tracked trainers;

  @tracked showEmails = false;
  @tracked isSubmitting = false;

  @tracked editStudent;
  @tracked studentForm;
  @tracked editNote;

  @tracked foundPeople = null;
  @tracked noSearchMatch = null;
  @tracked addPersonForm = null;


  // How many people have passed
  get passedCount() {
    let passed = 0;
    this.students.forEach((student) => {
      if (student.scored && student.passed) {
        passed++;
      }
    });

    return passed;
  }

  get year() {
    return dayjs(this.slot.begins).year();
  }

  /**
   * Is the user allowed to add a student to the class?
   *
   * For dirt training - only Clubhouse Admins may do so. (per TA 2020 request)
   * For ARTS - any trainer.
   */

  get canAddStudent() {
    return this.training.is_art || this.session.isAdmin;
  }

  // How many Dirt Vets (2 or more rangering years) OR
  // ART vets (if not a ART prospective)
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
  get prospectiveCount() {
    const is_art = this.training.is_art;
    let prospective = 0;

    this.students.forEach((student) => {
      if (is_art) {
        if (student.is_art_prospective) {
          prospective++;
        }
      } else if (student.status === 'prospective') {
        prospective++;
      }
    });

    return prospective;
  }

  // How many dirt PNV or ART prospectives

  get auditorCount() {
    let auditors = 0;

    this.students.forEach((student) => {
      if (student.status === 'auditor') {
        auditors++;
      }
    });

    return auditors;
  }

  get firstYearCount() {
    let firstYear = 0;

    this.students.forEach((student) => {
      if (student.years === 1) {
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
    this.editStudent = student;
    this.studentForm = {
      rank: student.rank,
      note: '',
      passed: student.passed ? 1 : 0,
      feedback_delivered: student.feedback_delivered ? 1 : 0
    };
  }

  @action
  cancelStudentAction() {
    this.editStudent = null;
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

    this.isSubmitting = true;

    this.ajax.post(`training-session/${this.slot.id}/score-student`, {data: score})
      .then((results) => {
        this.editStudent = null;
        this.students = results.students;
        this.toast.success(`${student.callsign} was successfully saved.`);
      }).catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.isSubmitting = false);
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
    this.isSubmitting = true;
    this.ajax.post(`training-session/${this.slot.id}/trainer-status`, {data: {trainers}})
      .then((results) => {
        this.trainers = results.trainers;
        this.toast.success('Trainer attendance was successfully updated.');
      }).catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.isSubmitting = false);
  }

  // Show the dialog to add a person
  @action
  showAddPersonAction() {
    this.foundPeople = null;
    this.noSearchMatch = null;
    this.addPersonForm = EmberObject.create({name: ''});
  }

  @action
  searchPeopleAction(field, model) {
    debounce(this, this._performSearch, model, SEARCH_RATE_MS);
  }

  _performSearch(model) {
    const query = model.name.trim();

    if (query.length < 2) {
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
      this.foundPeople = results.person;
      if (!results.person.length) {
        this.noSearchMatch = query;
      }
    }).catch((response) => this.house.handleErrorResponse(response));
  }

  @action
  cancelSearchAction() {
    this.addPersonForm = null;
  }

  @action
  addPersonAction(person, event) {
    event.preventDefault();
    slotSignup(this, this.slot, person, () => {
      this.addPersonForm = null;
      // Refresh the list
      this.ajax.request(`training-session/${this.slot.id}`).then((results) => {
        const student = results.students.find((s) => s.id == person.id);
        if (student) {
          this.students.push(student);
          this.students = _.orderBy(this.students, [(s) => s.callsign.toLowerCase()], ['asc']);
        }
      }).catch((response) => this.house.handleErrorResponse(response))
    });
  }

  // Remove a student from the session
  @action
  removeStudentAction() {
    const student = this.editStudent;

    this.modal.confirm('Confirm Student Removal', `Are you really sure you want to remove ${student.callsign} from this session?`, () => {
      this.iSubmitting = true;
      this.ajax.delete(`person/${student.id}/schedule/${this.slot.id}`)
        .then((results) => {
          if (results.status === 'success') {
            this.students.removeObject(student);
            this.toast.success(`${student.callsign} was successfully removed from this training session.`);
            this.editStudent = null;
          } else {
            this.toast.error(`The server responded with an unknown status code [${results.status}]`);
          }
        })
        .catch((response) => this.house.handleErrorResponse(response))
        .finally(() => this.isSubmitting = false);
    });
  }

  // Toggle the email list
  @action
  toggleEmailListAction() {
    this.showEmails = !this.showEmails;
    if (this.showEmails) {
      this.house.scrollToElement('#email-list');
    }
  }


  @action
  editNoteAction(note) {
    this.editNote = note;

  }
  @action
  cancelNoteAction() {
    this.editNote = null;
  }

  @action
  updateNoteAction(model) {
    this.ajax.request(`training-session/${model.id}/update-note`, {
      method: 'POST',
      data: {
        note: model.note
      }
    }).then(() => {
      set(this.editNote, 'note', model.note);
      this.toast.success('The note was successfully updated.');
      this.editNote = null;
    }).catch((response) => this.house.handleErrorResponse(response))
  }

  @action
  deleteNoteAction(note) {
    this.modal.confirm('Confirm Deletion', 'Are you really sure you want to delete this note?', () => {
      this.ajax.request(`training-session/${note.id}/delete-note`, { method: 'DELETE'})
        .then(() => {
          set(this.editStudent, 'notes', this.editStudent.notes.filter((n) => n.id !== note.id));
          this.toast.success('The note was successfully deleted.');
        }).catch((response) => this.house.handleErrorResponse(response));
    });
  }

}
