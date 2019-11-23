import Component from '@ember/component';
import { computed } from '@ember/object';

import { tagName } from '@ember-decorators/component';

@tagName('h1')
export default class YearSelectComponent extends Component {
  static positionalParams = ['title'];

  // Heading
  title = null;

  // action to call when year is changed
  onChange = null;

  // Year list
  years = null;

  // Starting year
  year = 0;

  // Is this a subheader?
  subheader = false;
  inline = false;

  // Additional classnames to add
  gridClass = null;

  constructor() {
    super(...arguments);

    if (this.subheader) {
      this.tagName = 'div';
      this.classNames = ['h2'];
    } else if (this.inline) {
      this.tagName = 'div'
    }

    if (this.gridClass) {
      this.classNames = this.gridClass.split(' ').concat(this.classNames)
    }
  }

  @computed("years")
  get yearOptions() {
    const currentYear = this.house.currentYear();
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
