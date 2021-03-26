import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';

export default class ReportsScheduleByPositionController extends ClubhouseController {
  queryParams = ['year'];

  @tracked expandAll = false;

  @action
  toggleExpandAll() {
    this.expandAll = !this.expandAll;
    this.house.toggleAllAccordions(this.expandAll);
  }

  @action
  scrollToPosition(id, event) {
    event.preventDefault();
    this.house.scrollToElement(`#position-${id}`, true);
  }

  get letterOptions() {
    let letters = {};
    this.positions.forEach((p) => {
      const letter = p.title.charAt(0).toUpperCase();
      if (!letters[letter]) {
        letters[letter] = p.id;
      }
    });

    return Object.keys(letters).sort().map((letter) => {
      return { id: letters[letter], letter };
    });
  }
}
