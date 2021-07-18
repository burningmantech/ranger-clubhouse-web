import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {cached, tracked} from '@glimmer/tracking';

export default class ReportsScheduleByPositionController extends ClubhouseController {
  queryParams = ['year'];

  @tracked expandAll = false;
  @tracked positions = [];
  @tracked activeFilter = 'active';

  activeOptions = [
    [ 'Active', 'active'],
    [ 'Inactive', 'inactive' ],
    [ 'All', 'all']
  ];

  @cached
  get viewPositions() {
    switch (this.activeFilter) {
      case 'all':
        return this.positions;
    }

    const wantActive = (this.activeFilter === 'active') ?  1 : 0;

    const positions = [];
    this.positions.forEach((p) => {
      const slots = p.slots.filter((s) => s.active === wantActive);

      if (!slots.length) {
        return;
      }

      positions.push({
        id: p.id,
        title: p.title,
        active: p.active,
        activeCount: p.activeCount,
        inactiveCount: p.inactiveCount,
        slots: p.slots.filter((s) => s.active === wantActive)
      })
    });

    return positions;
  }

  @cached
  get letterOptions() {
    let letters = {};
    this.viewPositions.forEach((p) => {
      const letter = p.title.charAt(0).toUpperCase();
      if (!letters[letter]) {
        letters[letter] = p.id;
      }
    });

    return Object.keys(letters).sort().map((letter) => {
      return {id: letters[letter], letter};
    });
  }

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
}
