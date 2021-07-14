import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action, set} from '@ember/object';
import dayjs from 'dayjs';
import {tracked} from '@glimmer/tracking';

export default class MentorAcceptanceSheetsController extends ClubhouseController {
  @tracked filter;
  @tracked alphas;
  @tracked viewAlphas;
  @tracked printAlphas;
  @tracked isPrinting;
  @tracked selectAll;

  @action
  toggleAll(event) {
    const selected = event.target.checked;
    this.alphas.forEach((alpha) => set(alpha, 'selected', selected));
    this._buildPrintAlphas();
  }

  @action
  toggleAlpha(alpha) {
    set(alpha, 'selected', !alpha.selected);
    this.selectAll = false;
    this._buildPrintAlphas();
  }

  @action
  changeFilter(value) {
    this.filter = value;
    this._buildViewAlphas();
  }

  _buildViewAlphas() {
    const filter = this.filter;
    if (filter === 'all') {
      this.viewAlphas = this.alphas;
    } else if (filter === 'no-signup') {
      this.viewAlphas = this.alphas.filter((a) => !a.alpha_slot);
    } else {
      this.viewAlphas = this.alphas.filter((a) => (a.alpha_slot && this.filter === a.alpha_slot.begins));
    }

    this._buildPrintAlphas()
  }

  get filterOptions() {
    const dates = this.alphas.filter((a) => a.alpha_slot != null)
      .uniqBy('alpha_slot.begins')
      .mapBy('alpha_slot.begins')
      .sort();

    const options = dates.map((date) => {
      return [dayjs(date).format('ddd MMM DD [@] HH:mm'), date];
    });

    options.unshift(['No Mentor Shift', 'no-signup']);
    options.unshift(['All', 'all']);

    return options;
  }

  _buildPrintAlphas() {
    this.printAlphas = this.viewAlphas.filter((a) => a.selected);
  }

  @action
  printAction() {
    const alphas = this.printAlphas;

    if (!alphas.length) {
      this.modal.info(null, 'No alphas were selected.');
      return;
    }

    this.isPrinting = true;
  }

  @action
  showAlphasAction() {
    this.isPrinting = false;
  }
}
