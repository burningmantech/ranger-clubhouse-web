import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import { action, set } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class MentorConvertController extends ClubhouseController {
  @tracked alphas;
  @tracked passAll = false;
  @tracked bonkAll = false;
  @tracked isSubmitting = false;


  get bonkCount() {
    return this.bonked.reduce((total, a) => (a.selected ? 1 : 0) + total, 0);
  }

  get passCount() {
    return this.passed.reduce((total, a) => (a.selected ? 1 : 0) + total, 0);
  }

  @action
  togglePassAll(event) {
    const checked = event.target.checked;
    this.passAll = checked;
    this.passed.forEach((p) => {
      if (!p.converted) {
        set(p, 'selected', checked)
      }
    });
  }

  @action
  toggleBonkAll(event) {
    const checked = event.target.checked;
    this.bonkAll = checked;
    this.bonked.forEach((p) => {
      if (!p.converted) {
        set(p, 'selected', checked);
      }
    });
  }

  @action
  convertAction(people, status) {
    const selected = people.filter((a) => a.selected);

    if (!selected) {
      this.modal.info(null, 'No alphas were selected.');
      return;
    }

    const alphas = selected.map((s) => {
      return { id: s.id, status };
    });

    this.isSubmitting = true;
    this.ajax.request('mentor/convert-alphas', { method: 'POST', data: { alphas } }).then((result) => {
      const converted = result.alphas;

      converted.forEach((convert) => {
        const person = selected.find((s) => s.id == convert.id);

        if (!person) {
          return;
        }

        set(person, 'status', convert.status);
        set(person, 'converted', true);
        set(person, 'selected', false);
      });

      this.toast.success(`${converted.length} Alpha(s) have been converted`);
    }).finally(() => this.isSubmitting = false);
  }
}
