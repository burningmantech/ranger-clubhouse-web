import Component from '@glimmer/component';

/*
 * Component helper - loop through a block N number of times.
 */

export default class NumberOfTimesComponent extends Component {
  get loops() {
    const iterations = [], times = +this.args.times;
    for (let i = 0; i < times; i++) {
      iterations.push(i);
    }

    return iterations;
  }
}
