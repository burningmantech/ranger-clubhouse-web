import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';
import {service} from '@ember/service';

export default class PersonTicketProvisionsProgressComponent extends Component {
  @service ajax;
  @service house;

  @tracked isLoading = false;
  @tracked progressInfo;

  constructor() {
    super(...arguments);

    this.isLoading = true;
    this.ajax.request(`person/${this.args.person.id}/tickets-provisions-progress`)
      .then(({progress}) => {
        this.progressInfo = progress;
        this.items = progress.items.reduce((items, item) => {
          this._formatItem(item);
          items[item.name] = item;
          return items;
        }, {})
      })
      .catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.isLoading = false)
  }

  get isNotRanger() {
    return !this.args.person.isRanger;
  }

  get isShinyPenny() {
    return this.args.progressInfo.is_shiny_penny;
  }

  _formatItem(item) {
    const isHours = item.measure === 'hours';

    ['value', 'expected_total', 'needs_to_work', 'needs_to_schedule'].forEach((key) => {
      item[key] = isHours ? this.hourMinute(item[key]) : item[key].toFixed(2);
    })
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
