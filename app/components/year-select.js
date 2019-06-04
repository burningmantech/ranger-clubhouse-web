import Component from '@ember/component';
import { computed } from '@ember/object';
import { argument } from '@ember-decorators/argument';
import { optional } from '@ember-decorators/argument/types';
import { tagName } from '@ember-decorators/component';

@tagName('h1')
export default class YearSelectComponent extends Component {
  static positionalParams = [ 'title' ];

  // Heading
  @argument('string') title;

  // action to call when year is changed
  @argument('object') onChange;

  // Year list
  @argument(optional('object')) years;

  // Starting year
  @argument('any') year = 0;

  // Is this a subheader?
  @argument(optional('boolean')) subheader = false;
  @argument(optional('boolean')) inline = false;

  // Additional classnames to add
  @argument(optional('string')) gridClass = null;

  init() {
    super.init(...arguments);

    if (this.subheader) {
      this.tagName = 'div';
      this.classNames = [ 'h2' ];
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
