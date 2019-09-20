import Controller from '@ember/controller';
import { action, set } from '@ember/object';
import { run, later } from '@ember/runloop';

export default class ReportsScheduleByPositionController extends Controller {
  queryParams = ['year'];

  @action
  togglePosition(position) {
    set(position, 'showing', !position.showing);
  }

  @action
  toggleExpandAll() {
    this.set('isExpanding', true);
    later(() => {
      run.schedule('afterRender', () => {
        this.set('expandAll', !this.expandAll);
        this.positions.forEach((p) => set(p, 'showing', this.expandAll));
        run.schedule('afterRender', () => {
          this.set('isExpanding', false);
        });
      });
    }, 10);

  }

  @action
  scrollToPosition(position) {
    set(position, 'showing', true);
    this.house.scrollToElement(`#position-${position.id}`, false);
  }
}
