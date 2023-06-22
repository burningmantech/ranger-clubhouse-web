import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action, set} from '@ember/object';
import {schedule, later} from '@ember/runloop';
import {cached, tracked} from '@glimmer/tracking';

export default class ReportsScheduleByCallsignController extends ClubhouseController {
  queryParams = ['year'];

  @tracked isExpanding = false;
  @tracked expandAll = false;

  @cached
  get callsignScrollItems() {
    return this.people.map((p) => ({
      id: `person-${p.id}`,
      title: p.callsign
    }));
  }

  @action
  toggleExpandAll() {
    this.isExpanding = true;
    later(() => {
      schedule('afterRender', () => {
        this.expandAll = !this.expandAll;
        this.people.forEach((p) => set(p, 'showing', this.expandAll));
        schedule('afterRender', () => {
          this.isExpanding = false;
        });
      });
    }, 10);

  }
}
