import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class YearSelectComponent extends Component {
  @service house;

  get yearOptions() {
    const currentYear = this.house.currentYear();
    let years = this.args.years;

    if (!years) {
      years = [];
      for (let y = 1998; y <= currentYear; y++) {
        years.push(y);
      }
    } else {
      years = this.args.years.slice();
    }

    if (!years.includes(currentYear)) {
      years.push(currentYear);
    }

    // descending sort
    years.sort((a, b) => (b - a));
    return years;
  }
}
