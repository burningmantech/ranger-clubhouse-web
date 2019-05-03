import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';
import { computed } from '@ember/object';
import { tagName } from '@ember-decorators/component';

/*
 * Component helper - loop through a block N number of times.
 */
 
@tagName('')
export default class NumberOfTimesComponent extends Component {
  @argument('number') times;

  @computed('times')
  get loops() {
    return new Array(+this.get('times'));
  }
}
