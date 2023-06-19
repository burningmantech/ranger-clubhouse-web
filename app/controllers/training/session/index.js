import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import EmberObject from '@ember/object';
import {debounce} from '@ember/runloop';
import {action, set} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {service} from '@ember/service';
import {isEmpty} from '@ember/utils';
import _ from 'lodash';
import conjunctionFormat from 'clubhouse/utils/conjunction-format';
import {AUDITOR, PROSPECTIVE} from "clubhouse/constants/person_status";

const SEARCH_RATE_MS = 300;

export default class TrainingSessionController extends ClubhouseController {
  @service shiftManage;
  @tracked graduateTraining;

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


  /**
   * How many people have passed training?
   *
   * @returns {number}
   */

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
   * For dirt training - only Clubhouse Admins and folks holding the real Trainer role (not Trainer Seasonal, masquerading as Trainer)
   * For ARTS - any trainer.
   *
   * @returns {boolean}
   */

  get canAddStudent() {
    return this.training.is_art || this.session.isAdmin || this.session.isRealTrainer;
  }

  /**
   * How many Dirt Vets (2 or more rangering years) OR ART vets (if not an ART prospective)
   * @returns {number}
   */

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

  /**
   * How many Applicants or ART prospectives?
   * @returns {number}
   */

  get prospectiveCount() {
    const is_art = this.training.is_art;
    let prospective = 0;

    this.students.forEach((student) => {
      if (is_art) {
        if (student.is_art_prospective) {
          prospective++;
        }
      } else if (student.status === PROSPECTIVE) {
        prospective++;
      }
    });

    return prospective;
  }

  /**
   * How many Applicants or ART prospectives?
   * @returns {number}
   */

  get auditorCount() {
    let auditors = 0;

    this.students.forEach((student) => {
      if (student.status === AUDITOR) {
        auditors++;
      }
    });

    return auditors;
  }

  /**
   * How many first year (binaries) Rangers?
   *
   * @returns {number}
   */

  get firstYearCount() {
    let firstYear = 0;

    this.students.forEach((student) => {
      if (student.years === 1) {
        firstYear++;
      }
    });

    return firstYear;
  }

  /**
   * How many total trainers (Uber, Assoc., etc) signed up?
   *
   * @returns {number}
   */

  get trainerCount() {
    return this.trainers.reduce((total, group) => {
      return group.trainers.length + total;
    }, 0);
  }

  /**
   * Does this ART offer the ability to grant people the ARTs positions (either mentee, or actual working position)
   * after the trainees have been marked as passed?
   *
   * @returns {boolean}
   */

  get offersGraduation() {
    return !!this.training.graduation_info;
  }

  /**
   * What positions will be granted after hitting the graduate button?
   *
   * @returns {String}
   */

  get graduatePositionTitles() {
    return conjunctionFormat(this.training.graduation_info.positions.map((p) => p.title), 'and');
  }

  /**
   * Setup to edit the student record.
   *
   * @param student
   */

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

  /**
   * Cancel the student modal.
   */

  @action
  cancelStudentAction() {
    this.editStudent = null;
  }

  /**
   * Save the student record.
   *
   * @param model
   */

  @action
  saveStudentAction(model) {
    const student = this.editStudent;
    const {note, passed} = model;

    const rank = +model.rank;

    const score = {
      id: student.id,
      note,
      passed: +passed ? 1 : 0,
      rank,
    };

    if (!this.training.is_art) {
      if (!rank && passed && student.need_ranking) {
        model.pushErrors('rank', ['Trainee needs a rank.']);
        return;
      }

      const existingNotes = student.notes.filter((n) => !n.is_log);
      // Only require a note if the rank set was not 2 (aka normal, average, etc.)
      if ((rank > 0 && rank !== 2) && (isEmpty(note) && !existingNotes.length)) {
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

  /**
   * Save the trainer records in bulk.
   */

  @action
  async saveTrainers() {
    const trainers = [];

    this.trainers.forEach((type) => {
      type.trainers.forEach((trainer) => {
        trainers.push({
          person_id: trainer.id,
          status: trainer.status,
          trainer_slot_id: trainer.trainer_slot_id,
          is_lead: trainer.is_lead ? 1 : 0,
        });
      });
    });

    this.isSubmitting = true;
    try {
      this.trainers = (await this.ajax.post(`training-session/${this.slot.id}/trainer-status`, {data: {trainers}})).trainers;
      this.toast.success('Trainer attendance was successfully updated.');
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }

  /**
   * Show the dialog to add a person
   */

  @action
  showAddPersonAction() {
    this.foundPeople = null;
    this.noSearchMatch = null;
    this.addPersonForm = EmberObject.create({name: ''});
  }

  /**
   * Start debouncing the search for a person's callsign.
   *
   * @param field
   * @param model
   */

  @action
  searchPeopleAction(field, model) {
    debounce(this, this._performSearch, model, SEARCH_RATE_MS);
  }

  /**
   * Perform a callsign lookup
   *
   * @param model
   * @private
   */

  async _performSearch(model) {
    const query = model.name.trim();

    if (query.length < 2) {
      return;
    }

    try {
      const people = await this.ajax.request('person/search', {
        data: {
          query,
          search_fields: 'name,callsign,email',
          exclude_statuses: 'deceased,dismissed,bonked,retired,uberbonked',
          limit: 10
        }
      });
      this.foundPeople = people;
      if (!people.length) {
        this.noSearchMatch = query;
      }
    } catch (response) {
      this.house.handleErrorResponse(response);
    }
  }

  /**
   * Cancel the add student search dialog
   *
   */
  @action
  cancelSearchAction() {
    this.addPersonForm = null;
  }

  /**
   * Attempt to add a person to the training session.
   *
   * @param person
   * @param event
   */

  @action
  addPersonAction(person, event) {
    event.preventDefault();
    this.shiftManage.slotSignup(this.slot, person, () => {
      this.addPersonForm = null;
      // Refresh the list
      this.ajax.request(`training-session/${this.slot.id}`).then((results) => {
        const student = results.students.find((s) => +s.id === +person.id);
        if (student) {
          this.students.push(student);
          this.students = _.orderBy(this.students, [(s) => s.callsign.toLowerCase()], ['asc']);
        }
      }).catch((response) => this.house.handleErrorResponse(response))
    });
  }

  /**
   * Attempt to remove a student from the session.
   */

  @action
  removeStudentAction() {
    const student = this.editStudent;

    this.modal.confirm('Confirm Student Removal', `Are you really sure you want to remove ${student.callsign} from this session?`, () => {
      this.isSubmitting = true;
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

  /**
   * Toggle showing the email list
   *
   * @param {Function|null} closeDropdown
   */

  @action
  toggleEmailListAction(closeDropdown) {
    this.showEmails = !this.showEmails;
    if (this.showEmails) {
      this.house.scrollToElement('#email-list');
    }
    if (closeDropdown) {
      closeDropdown();
    }
  }

  /**
   * Setup to edit a specific note.
   *
   * @param note
   */

  @action
  editNoteAction(note) {
    this.editNote = note;

  }

  /**
   * Cancel a note edit.
   */

  @action
  cancelNoteAction() {
    this.editNote = null;
  }

  /**
   * Attempt to save a note's edits.
   *
   * @param model
   */

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

  /**
   * Attempt to delete the note.
   *
   * @param note
   */

  @action
  deleteNoteAction(note) {
    this.modal.confirm('Confirm Deletion', 'Are you really sure you want to delete this note?', () => {
      this.ajax.request(`training-session/${note.id}/delete-note`, {method: 'DELETE'})
        .then(() => {
          set(this.editStudent, 'notes', this.editStudent.notes.filter((n) => n.id !== note.id));
          this.toast.success('The note was successfully deleted.');
        }).catch((response) => this.house.handleErrorResponse(response));
    });
  }

  /**
   * Show the graduation dialog.
   */
  @action
  showGraduateStudentsAction() {
    this.graduateTraining = this.training;
  }

  /**
   * Cancel the graduation dialog
   */
  @action
  cancelGraduateStudents() {
    this.graduateTraining = null;
  }
}
