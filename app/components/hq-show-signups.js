import Component from '@glimmer/component';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {service} from '@ember/service';
import {HQ_LEAD, HQ_RUNNER, HQ_SHORT, HQ_WINDOW} from "clubhouse/constants/positions";

const POSITIONS = {
  short: {position: HQ_SHORT, label: 'S', desc: 'HQ Shorts'},
  lead: {position: HQ_LEAD, label: 'L', desc: 'HQ Leads'},
  window: {position: HQ_WINDOW, label: 'W', desc: 'HQ Window Workers'},
  runner: {position: HQ_RUNNER, label: 'R', desc: 'HQ Runners'},
};

export default class HqShowSignupsComponent extends Component {
  @service ajax;
  @service house;
  @tracked isLoading = true;
  @tracked isOpen = false;
  @tracked people;

  constructor() {
    super(...arguments);
    const position = POSITIONS[this.args.type];
    this.label = position.label;
    this.desc = position.desc;
  }


  @action
  onClose() {
    this.isOpen = false;
  }

  @action
  async onShow() {
    this.isOpen = true;
    try {
      this.isLoading = true;
      const {people} = await this.ajax.request('slot/people-in-period', {
        data: {
          position_id: POSITIONS[this.args.type].position,
          period: this.args.period,
          interval: this.args.interval,
        }
      });
      this.people = people;
    } catch (e) {
      this.house.handleErrorResponse(e);
    } finally {
      this.isLoading = false;
    }
  }
}
