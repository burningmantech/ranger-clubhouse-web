import Component from '@ember/component';
import { computed } from '@ember/object';

/*
 * Component helper - loop through a block N number of times.
 */

export default class NumberOfTimesComponent extends Component {
  tagName = '';
  times = null;

  @computed('times')
  get loops() {
    const iterations = [], times = +this.get('times');
    for (let i = 0; i < times; i++) {
      iterations.push(i);
    }

    return iterations;
  }
}
