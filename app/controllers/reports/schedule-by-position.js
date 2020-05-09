import Controller from '@ember/controller';
import { action, set } from '@ember/object';
import { run, later } from '@ember/runloop';
import { tracked } from '@glimmer/tracking';

export default class ReportsScheduleByPositionController extends Controller {
  queryParams = ['year'];

  @tracked isExpanding = false;
  @tracked expandAll = false;

  @action
  togglePosition(position, event) {
    event.preventDefault();
    set(position, 'showing', !position.showing);
  }

  @action
  toggleExpandAll() {
    this.isExpanding = true;
    later(() => {
      run.schedule('afterRender', () => {
        this.expandAll = !this.expandAll;
        this.positions.forEach((p) => set(p, 'showing', this.expandAll));
        run.schedule('afterRender', () => {
          this.isExpanding = false;
        });
      });
    }, 10);

  }

  @action
  scrollToPosition(position, event) {
    event.preventDefault();
    set(position, 'showing', true);
    this.house.scrollToElement(`#position-${position.id}`, false);
  }
}
