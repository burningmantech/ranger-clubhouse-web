import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {cached, tracked} from '@glimmer/tracking';

export default class MentorAcceptanceSheetsController extends ClubhouseController {
  @tracked filter;
  @tracked alphas;
  @tracked viewAlphas;
  @tracked isPrinting;
  @tracked selectAll;
  @tracked filterOptions;

  @action
  toggleAll(event) {
    const selected = event.target.checked;
    this.alphas.forEach((alpha) => alpha.selected = selected);
  }

  @action
  toggleAlpha() {
    this.selectAll = false;
    return true;
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
      this.viewAlphas = this.alphas.filter((a) => !a.alpha_slots);
    } else {
      this.viewAlphas = this.alphas.filter((a) => a.alpha_slots?.find((s) => this.filter === s.begins));
    }
  }


  @cached
  get printAlphas() {
    return this.viewAlphas.filter((a) => a.selected);
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
