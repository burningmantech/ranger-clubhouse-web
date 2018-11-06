import Component from '@ember/component';
import { computed } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';
import { tagName } from '@ember-decorators/component';

@tagName('')
export default class YearSelectComponent extends Component {
  static positionalParams = [ 'title' ];

  // Heading
  @argument title;

  // action to call when year is changed
  @argument onChange;

  // Year list
  @argument years;

  // Starting year
  @argument year = 0;

  @computed("years")
  get yearOptions() {
    const currentYear = (new Date()).getFullYear();
    let years = this.years;

    if (!years) {
      years = [];
      for (let y = 1998; y <= currentYear; y++) {
        years.push(y);
      }
    } else {
      years = this.years.slice();
    }

    if (!years.includes(currentYear)) {
      years.push(currentYear);
    }

    // descending sort
    years.sort((a, b) => (b - a));
    return years;
  }
}
