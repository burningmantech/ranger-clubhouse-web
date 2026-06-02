import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import EmberObject from '@ember/object';
import {debounce} from '@ember/runloop';
import {action, set} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {service} from '@ember/service';
import {isEmpty} from '@ember/utils';
import _ from 'lodash';
import countIf from 'clubhouse/utils/count-if';
import conjunctionFormat from 'clubhouse/utils/conjunction-format';
import {AUDITOR, PROSPECTIVE} from "clubhouse/constants/person_status";
import {ADMIN, ART_GRADUATE_BASE} from "clubhouse/constants/roles";

const SEARCH_RATE_MS = 300;
const MIN_SEARCH_LENGTH = 2;
const SERVER_STATUS_SUCCESS = 'success';

// A note flagged is_log is a system audit entry, not an editable trainer note.
const isTrainerNote = (note) => !note.is_log;

export default class TrainingSessionController extends ClubhouseController {
  @service shiftManage;

  // Set by the route's setupController.
  @tracked training;
  @tracked slot;
  @tracked year;
  @tracked students;
  @tracked trainers;

  @tracked graduateTraining;
  @tracked showWorkHistoryPerson;

  @tracked showEmails = false;
  @tracked isSubmitting = false;

  @tracked addingTrainer = false;
  @tracked addTrainerOptions = null;
  @tracked addTrainerSlotId = null;

  @tracked editStudent;
  @tracked studentForm;
  @tracked editNote;

  @tracked foundPeople = null;
  @tracked noSearchMatch = null;
  @tracked addPersonForm = null;

  // Monotonic token used to discard out-of-order search responses.
  _searchSeq = 0;

  rankOptions = [
    ["No Rank", ''],
    ["1 - Above Average (Note Required)", 1],
    ["2 - Average", 2],
    ["3 - Below Average (Note Required)", 3],
    ["4 - FLAG (Note Required)", 4]
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

  /**
   * Are any primary trainers signed up to teach this session?
   *
   * @returns {boolean}
   */

  get havePrimaryTrainers() {
    return this.trainers.some((group) => group.is_primary_trainer && group.trainers.length > 0);
  }

  /**
   * How many people have passed training?
   *
   * @returns {number}
   */

  get passedCount() {
    return countIf(this.students, (student) => student.scored && student.passed);
  }

  /**
   * Is the user allowed to adjust the trainer or trainee rosters?
   *
   * For dirt training - only Clubhouse Admins and folks holding the real Trainer role (not Trainer Seasonal, masquerading as Trainer)
   * For ARTS - any trainer.
   *
   * @returns {boolean}
   */

  get canAdjustRosters() {
    return this.training.is_art || this.session.isAdmin || this.session.isRealTrainer;
  }

  /**
   * How many Dirt Vets (2 or more rangering years) OR ART vets (if not an ART prospective)
   * @returns {number}
   */

  get vetCount() {
    return countIf(this.students, (student) =>
      this.training.is_art ? !student.is_art_prospective : student.years > 1);
  }

  /**
   * How many Applicants or ART prospectives?
   * @returns {number}
   */

  get prospectiveCount() {
    return countIf(this.students, (student) =>
      this.training.is_art ? student.is_art_prospective : student.status === PROSPECTIVE);
  }

  /**
   * How many auditors?
   * @returns {number}
   */

  get auditorCount() {
    return countIf(this.students, (student) => student.status === AUDITOR);
  }

  /**
   * How many first year (binaries) Rangers?
   *
   * @returns {number}
   */

  get firstYearCount() {
    return countIf(this.students, (student) => student.years === 1);
  }

  /**
   * How many total trainers (Uber, Assoc., etc) signed up?
   *
   * @returns {number}
   */

  get trainerCount() {
    return this.trainers.reduce((total, group) => total + group.trainers.length, 0);
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

  get canGraduate() {
    return this.training.graduation_info && this.session.hasRole([ADMIN, ART_GRADUATE_BASE | this.training.id]);
  }

  /**
   * What positions will be granted after hitting the graduate button?
   *
   * @returns {String}
   */

  get graduatePositionTitles() {
    return conjunctionFormat((this.training.graduation_info?.positions ?? []).map((p) => p.title), 'and');
  }

  /**
   * Run an async submission with isSubmitting toggled and errors routed to the house service.
   *
   * @param {Function} work async callback to run while isSubmitting is true
   * @private
   */

  async _withSubmitting(work) {
    this.isSubmitting = true;
    try {
      await work();
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }

  /**
   * Reload the trainer roster for this session.
   *
   * @private
   */

  async _reloadTrainers() {
    this.trainers = (await this.ajax.request(`training-session/${this.slot.id}/trainers`)).trainers;
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
  async saveStudentAction(model) {
    const student = this.editStudent;
    const {note, passed} = model;
    const rank = +model.rank;

    if (!rank && passed && student.need_ranking) {
      model.pushErrors('rank', ['Trainee needs a rank.']);
      return;
    }

    const existingNotes = student.notes.filter(isTrainerNote);
    // A note is required for any non-average rank, unless a prior note already justifies it.
    if ((rank > 0 && rank !== 2) && (isEmpty(note) && !existingNotes.length)) {
      model.addError('note', ['A note needs to be entered if a rank other than 2 is given.']);
      return;
    }

    const score = {
      id: student.id,
      note,
      passed: +passed ? 1 : 0,
      rank,
      feedback_delivered: model.feedback_delivered ? 1 : 0,
    };

    await this._withSubmitting(async () => {
      const {students} = await this.ajax.post(`training-session/${this.slot.id}/score-student`, {data: score});
      this.editStudent = null;
      this.students = students;
      this.toast.success(`${student.callsign} was successfully saved.`);
    });
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

    await this._withSubmitting(async () => {
      this.trainers = (await this.ajax.post(`training-session/${this.slot.id}/trainer-status`, {data: {trainers}})).trainers;
      this.toast.success('Trainer attendance was successfully updated.');
    });
  }

  /**
   * Show the dialog to add a trainee.
   */

  @action
  showAddTraineeAction() {
    this._setupAddPerson(false);
  }

  /**
   * Show the dialog to add a trainer.
   */

  @action
  showAddTrainerAction() {
    if (this.trainers.length === 0) {
      this.modal.info('No Training Slots Found', 'There are no associated training slots found. Be sure the slots have been activated.');
      return;
    }

    this.addTrainerOptions = this.trainers.length > 1
      ? this.trainers.map((t) => [t.position_title, t.slot.id])
      : null;
    this.addTrainerSlotId = this.trainers[0]?.slot?.id;
    this._setupAddPerson(true);
  }

  /**
   * Reset the add-person search dialog state.
   *
   * @param {boolean} isTrainer true when adding a trainer, false for a trainee
   * @private
   */

  _setupAddPerson(isTrainer) {
    this.addingTrainer = isTrainer;
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
   * Perform a callsign lookup. Stale (out-of-order) responses are discarded.
   *
   * @param model
   * @private
   */

  async _performSearch(model) {
    const query = model.name.trim();

    if (query.length < MIN_SEARCH_LENGTH) {
      this.foundPeople = null;
      this.noSearchMatch = null;
      return;
    }

    const seq = ++this._searchSeq;
    try {
      const people = await this.ajax.request('person/search', {
        data: {
          query,
          search_fields: 'name,callsign,email',
          exclude_statuses: 'deceased,dismissed,bonked,retired,uberbonked',
          limit: 10
        }
      });

      // A newer search superseded this one while it was in flight.
      if (seq !== this._searchSeq) {
        return;
      }

      this.foundPeople = people;
      this.noSearchMatch = people.length ? null : query;
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

    const slot = this.addingTrainer
      ? this.trainers.find((t) => t.slot.id === +this.addTrainerSlotId)?.slot
      : this.slot;

    if (!slot) {
      this.toast.error('Unable to determine which slot to sign up for. Try reopening the dialog.');
      return;
    }

    this.shiftManage.slotSignup(slot, person, async () => {
      this.addPersonForm = null;
      // Refresh from the authoritative roster the server returns.
      try {
        if (this.addingTrainer) {
          await this._reloadTrainers();
        } else {
          const {students} = await this.ajax.request(`training-session/${this.slot.id}`);
          this.students = _.orderBy(students, [(s) => (s.callsign ?? '').toLowerCase()], ['asc']);
        }
      } catch (e) {
        this.house.handleErrorResponse(e);
      }
    });
  }

  /**
   * Confirm and remove a person from a slot's schedule.
   *
   * @param {object} person the person being removed (needs id & callsign)
   * @param {object} slot the slot to remove the person from
   * @param {string} title the modal confirmation title
   * @param {Function} onSuccess called after a successful removal
   * @private
   */

  _removeFromSchedule(person, slot, title, onSuccess) {
    this.modal.confirm(title, `Are you really sure you want to remove ${person.callsign} from this session?`,
      () => this._withSubmitting(async () => {
        const {status} = await this.ajax.delete(`person/${person.id}/schedule/${slot.id}`);
        if (status === SERVER_STATUS_SUCCESS) {
          await onSuccess();
        } else {
          this.toast.error(`The server responded with an unknown status code [${status}]`);
        }
      }));
  }

  /**
   * Attempt to remove a student from the session.
   */

  @action
  removeStudentAction() {
    const student = this.editStudent;
    this._removeFromSchedule(student, this.slot, 'Confirm Student Removal', () => {
      this.students = this.students.filter((s) => s.id !== student.id);
      this.toast.success(`${student.callsign} was successfully removed from this training session.`);
      this.editStudent = null;
    });
  }

  @action
  removeTrainerAction(trainer, slot) {
    this._removeFromSchedule(trainer, slot, 'Confirm Trainer Removal', async () => {
      this.toast.success(`${trainer.callsign} was successfully removed from this training session.`);
      await this._reloadTrainers();
    });
  }

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
  async updateNoteAction(model) {
    await this._withSubmitting(async () => {
      await this.ajax.request(`training-session/${model.id}/update-note`, {
        method: 'POST',
        data: {note: model.note}
      });
      set(this.editNote, 'note', model.note);
      this.toast.success('The note was successfully updated.');
      this.editNote = null;
    });
  }

  /**
   * Attempt to delete the note.
   *
   * @param note
   */

  @action
  deleteNoteAction(note) {
    const student = this.editStudent;
    this.modal.confirm('Confirm Deletion', 'Are you really sure you want to delete this note?',
      () => this._withSubmitting(async () => {
        await this.ajax.request(`training-session/${note.id}/delete-note`, {method: 'DELETE'});
        if (student) {
          set(student, 'notes', student.notes.filter((n) => n.id !== note.id));
        }
        this.toast.success('The note was successfully deleted.');
      }));
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

  filterNotes(notes) {
    return notes ? notes.filter(isTrainerNote) : [];
  }

  @action
  showWorkHistory(person) {
    this.showWorkHistoryPerson = person;
  }

  @action
  closeWorkHistory() {
    this.showWorkHistoryPerson = null;
  }
}
