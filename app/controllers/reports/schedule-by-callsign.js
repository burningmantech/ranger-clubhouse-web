import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import { action, set } from '@ember/object';
import { run, later } from '@ember/runloop';
import { tracked } from '@glimmer/tracking';

export default class ReportsScheduleByCallsignController extends ClubhouseController {
  queryParams = ['year'];

  @tracked isExpanding = false;
  @tracked expandAll = false;

  @action
  togglePerson(person, event) {
    event.preventDefault();
    set(person, 'showing', !person.showing);
  }

  @action
  toggleExpandAll() {
    this.isExpanding = true;
    later(() => {
      run.schedule('afterRender', () => {
        this.expandAll = !this.expandAll;
        this.people.forEach((p) => set(p, 'showing', this.expandAll));
        run.schedule('afterRender', () => {
          this.isExpanding = false;
        });
      });
    }, 10);

  }

  @action
  scrollToCallsign(id, event) {
    event.preventDefault();
    this.house.scrollToElement(`#person-${id}`, false);
  }

  get letterOptions() {
    let letters = {};
    this.people.forEach((person) => {
      const letter = person.callsign.charAt(0).toUpperCase();
      if (!letters[letter]) {
        letters[letter] = person.id;
      }
    });

    return Object.keys(letters).sort().map((letter) => {
      return { id: letters[letter], letter };
    });
  }
}
