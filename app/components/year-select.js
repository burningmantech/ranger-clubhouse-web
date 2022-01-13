import Component from '@glimmer/component';
import { service } from '@ember/service';

export default class YearSelectComponent extends Component {
  @service house;

  get yearOptions() {
    const currentYear = this.house.currentYear();
    let years = this.args.years;
    const minYear = this.args.minYear ?? 1998;

    if (!years) {
      years = [];
      for (let y = minYear; y <= currentYear; y++) {
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
