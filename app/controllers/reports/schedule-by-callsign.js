import Controller from '@ember/controller';
import { action, computed, set } from '@ember/object';
import { run, later } from '@ember/runloop';

export default class ReportsScheduleByCallsignController extends Controller {
  queryParams = ['year'];

  @action
  togglePerson(person) {
    set(person, 'showing', !person.showing);
  }

  @action
  toggleExpandAll() {
    this.set('isExpanding', true);
    later(() => {
      run.schedule('afterRender', () => {
        this.set('expandAll', !this.expandAll);
        this.people.forEach((p) => set(p, 'showing', this.expandAll));
        run.schedule('afterRender', () => {
          this.set('isExpanding', false);
        });
      });
    }, 10);

  }

  @action
  scrollToCallsign(id) {
    console.log(`scrolling to ${id}`);
    this.house.scrollToElement(`#person-${id}`, false);
  }

  @computed('people')
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
