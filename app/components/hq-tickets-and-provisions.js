import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';
import {inject as service} from '@ember/service';

export default class HqTicketsAndProvisionsComponent extends Component {
  @tracked isLoading = false;
  @tracked isNotRanger = false;
  @service ajax;
  @service house;

  constructor() {
    super(...arguments);

    if (!this.args.person.isRanger) {
      this.isNotRanger = true;
      return; // Nope!
    }

    this.isLoading = true;

    this.ajax.request(`person/${this.args.person.id}/tickets-provisions-progress`).then(({progress}) => {
      this.items = progress.items.reduce((items, item) => {
        this._formatItem(item);
        items[item.name] = item;
        return items;
      }, {});
      this.isShinyPenny = progress.is_shiny_penny;
      this.isLoading = false;
    }).catch((response) => this.house.handleErrorResponse(response));
  }

  _formatItem(item) {
    const isHours = item.measure === 'hours';

    ['value', 'expected_total', 'needs_to_work', 'needs_to_schedule'].forEach((key) => {
      item[key] = isHours ? this.hourMinute(item[key]) : item[key].toFixed(2);
    })

    if (item.has_earned) {
      item.width = 100;
    } else {
      item.width = Math.floor((item.value / item.threshold) * 100);
    }
  }

  hourMinute(duration) {
    if (!duration) {
      return '0:00';
    }
    const minutes = Math.floor((duration / 60) % 60);
    const hours = Math.floor(duration / 3600);

    if (minutes < 10) {
      return `${hours}:0${minutes}`;
    } else {
      return `${hours}:${minutes}`;
    }
  }
}
