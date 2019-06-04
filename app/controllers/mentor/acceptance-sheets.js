import Controller from '@ember/controller';
import { action, computed, set } from '@ember/object';
import moment from 'moment';

export default class MentorAcceptanceSheetsController extends Controller {
  @action
  toggleAll(value) {
    this.alphas.forEach((alpha) => set(alpha, 'selected', value));
  }

  @computed('alphas.@each.selected', 'filter')
  get viewAlphas() {
    const filter = this.filter;
    if (filter == 'all') {
      return this.alphas;
    }

    if (filter == 'no-signup') {
      return this.alphas.filter((a) => !a.alpha_slot);
    }

    return this.alphas.filter((a) => (a.alpha_slot && this.filter == a.alpha_slot.begins));
  }

  @computed('alphas')
  get filterOptions() {
    const dates = this.alphas.filter((a) => a.alpha_slot != null)
          .uniqBy('alpha_slot.begins')
          .mapBy('alpha_slot.begins')
          .sort();

    const options = dates.map((date) => {
      return [ moment(date).format('ddd MMM DD [@] HH:mm'), date ];
    });

    options.unshift([ 'No Mentor Shift', 'no-signup']);
    options.unshift([ 'All', 'all']);

    return options;
  }

  @computed('viewAlphas.@each.selected')
  get printAlphas() {
    return this.viewAlphas.filter((a) => a.selected);
  }

  @action
  printAction() {
    const alphas = this.printAlphas;

    if (alphas.length == 0) {
      this.modal.info(null, 'No alphas were selected.');
      return;
    }

    this.set('isPrinting', true);
  }

  @action
  showAlphasAction() {
    this.set('isPrinting', false);
  }
}
