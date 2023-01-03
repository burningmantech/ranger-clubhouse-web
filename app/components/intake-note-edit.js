import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';
import {action} from '@ember/object';
import {service} from '@ember/service';

export default class IntakeNoteEditComponent extends Component {
  @service ajax;
  @service toast;
  @service modal;
  @service house;

  rankingOptions = [
    ["No Ranking", ''],
    ["1 - Green (Above Average)", 1],
    ["2 - Normal (Average)", 2],
    ["3 - Yellow (Below Average)", 3],
    ["4 - FLAG", 4]
  ];

  personnelRankingOptions = [
    ["No Ranking", ''],
    ["1 - Green (Above Average)", 1],
    ["2 - Normal (Average)", 2],
    ["3 - Yellow (Below Average)", 3],
    ["4 - FLAG (will alert other teams)", 4]
  ];

  @tracked isSubmitting = false;

  constructor() {
    super(...arguments);

    const notes = {};

    let ranking = '';
    const teamNotes = this.args.teamNotes, viewYear = +this.args.viewYear;

    teamNotes.forEach((intake) => {
      const year = +intake.year; // cast to integer
      if (year == viewYear) {
        ranking = intake.rank;
      }
    });

    this.ranking = ranking;
    this.notesToShow = notes;
    this.noteForm = {
      note: '',
      ranking,
      event_year: viewYear,
    };
  }

  get yearOptions() {
    const current = +(new Date().getFullYear());
    const list = [];

    for (let year = current; year >= 2010; year--) {
      list.push(year);
    }

    return list;
  }

  @action
  submitNoteAction(model, isValid) {
    if (!isValid) {
      return;
    }
    const ranking = model.ranking;
    const person = this.args.person;
    let note = model.note;

    if (note != null) {
      note = note.trim();
    }

    if (!ranking && ranking == this.ranking && !note) {
      this.modal.info(null, 'Please select a rank and/or enter a note');
      return;
    }

    const data = {
      type: this.args.type,
      year: model.event_year
    };

    if (ranking != this.ranking) {
      data.ranking = ranking;
    }

    if (note != '') {
      data.note = note;
    }

    this.isSubmitting = true;

    this.ajax.request(`intake/${person.id}/note`, {
      method: 'POST', data
    }).then(() => {
      this.toast.success('Note successfully saved.');
      this.args.onSubmit?.(person);
      this.args.closeNoteAction?.();
    }).catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.isSubmitting = false);
  }

}
