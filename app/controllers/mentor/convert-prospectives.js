import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import { action, set } from '@ember/object';
import { cached, tracked } from '@glimmer/tracking';

export default class MentorConvertController extends ClubhouseController {
  @tracked prospectives;
  @tracked selectedAll;
  @tracked isSubmitting;

  @action
  toggleAll(event) {
    const checked = event.target.checked;
    this.selectedAll = checked;
    this.prospectives.forEach((p) => {
      if (p.personnel_issue) {
        p.selected = false;
      } else {
        p.selected = checked;
      }
    });
  }

  @cached
  get personnelFlagCount() {
    return this.prospectives.filter((p) => p.personnel_issue).length;
  }

  @cached
  get convertCount() {
    return this.prospectives.filter((a) => a.selected).length;
  }

  @action
  convertAction() {
    const people = this.prospectives.filter((a) => a.selected);

    if (!people.length) {
      this.modal.info(null, 'No prospectives were selected.');
      return;
    }

    const ids = people.map((s) => s.id);
    this.isSubmitting = true;
    this.ajax.request('mentor/convert-prospectives', { method: 'POST', data: { prospectives: ids } }).then(({alphas}) => {
      alphas.forEach((id) => {
        const person = people.find((s) => s.id === id);

        if (!person) {
          return;
        }

        set(person, 'converted', true);
        set(person, 'selected', false);
      });

      this.toast.success(`${alphas.length} Prospectives has been converted to Alpha status`);
    }).finally(() => this.isSubmitting = false);
  }

  @action
  noteSubmitted(person) {
    // Refresh the potentials
    this.ajax.request('mentor/mentees', {data: {year: this.year, person_id: person.id}}).then(({mentee}) => {
      this.prospectives = this.prospectives.map((m) => m.id === person.id ? mentee : m);
    }).catch((response) => this.house.handleErrorResponse(response));
  }
}
