import Component from '@glimmer/component';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {ADMIN, VC} from "clubhouse/constants/roles";
import {service} from '@ember/service';

export default class PersonBannerManage extends Component {
  @service house;
  @service session;
  @tracked entry;

  get permanentBanners() {
    return this.args.personBanners.filter((n) => n.is_permanent);
  }

  get eventBanners() {
    return this.args.personBanners.filter((n) => !n.is_permanent);
  }

  get canAdministerBanners() {
    return this.session.hasRole([ADMIN, VC]);
  }

  @action
  edit(entry) {
    this.entry = entry;
  }

  @action
  closeDialog() {
    this.entry = null;
  }
}
