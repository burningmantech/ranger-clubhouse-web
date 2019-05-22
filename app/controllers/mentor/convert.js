import Controller from '@ember/controller';
import { action, computed, set } from '@ember/object';

export default class MentorConvertController extends  Controller {

  @computed('alphas')
  get passed() {
    return this.alphas.filter((a) => a.mentor_status == 'pass');
  }

  @computed('alphas')
  get bonked() {
    return this.alphas.filter((a) => (a.mentor_status == 'bonk' || a.mentor_status == 'self-bonk'));
  }

  @computed('bonked.@each.selected')
  get bonkCount() {
    return this.bonked.reduce((total, a) => (a.selected ? 1 : 0)+total, 0);
  }

  @computed('passed.@each.selected')
  get passCount() {
    return this.passed.reduce((total, a) => (a.selected ? 1 : 0)+total, 0);
  }

  @action
  togglePassAll(checked) {
    this.set('passAll', checked);
    this.passed.forEach((p) => set(p, 'selected', checked));
  }

  @action
  toggleBonkAll(checked) {
    this.set('bonkAll', checked);
    this.bonked.forEach((p) => set(p, 'selected', checked));
  }

  @action
  convertAction(people, status) {
    const selected = people.filter((a) => a.selected);

    if (selected.length == 0) {
      this.modal.info(null, 'No alphas were selected.');
      return;
    }

    const alphas = selected.map((s) => {
      return { id: s.id, status };
    });

    this.ajax.request('mentor/convert', { method: 'POST', data: { alphas }}).then((result) => {
      const converted = result.alphas;

      converted.forEach((convert) => {
        const person = selected.find((s) => s.id == convert.id);

        if (!person) {
          return;
        }

        set(person, 'status', convert.status);
        set(person, 'converted', true);
      });

      this.toast.success(`${converted.length} Alpha(s) have been converted`);
    });
  }
}
