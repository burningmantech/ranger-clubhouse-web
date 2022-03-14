import Component from '@glimmer/component';
import {action} from '@ember/object';
import {service} from '@ember/service';
import { tracked } from '@glimmer/tracking';

class Motd {
  @tracked showing = false;
  @tracked has_read = false;
  @tracked isMarking = false;

  constructor(motd){
    Object.assign(this, motd);
  }
}

export default class DashboardMotdComponent extends Component {
  @service ajax;
  @service toast;
  @service house;

  @tracked motds;

  constructor() {
    super(...arguments);
    const { hasBottomArrow } = this.args;

    this.hasBottomArrow = (hasBottomArrow === undefined ? true : hasBottomArrow);
    this.motds = this.args.motds.map((m) => new Motd(m));
  }

  @action
  toggleMotd(motd) {
    this.motds.forEach((m) => {
      m.showing = (motd.id === m.id) ? !motd.showing : false;
    });
  }

   get unreadMotds() {
    return this.motds.filter((m) => !m.has_read);
  }

  @action
  markMotdAsRead(motd) {
    motd.isMarking = true;
    this.ajax.request(`motd/${motd.id}/markread`, {method: 'POST'})
      .then(() => {
        motd.showing = false;
        motd.has_read = true;
        this.toast.success('Announcement marked as read.');
      }).catch((response) => this.house.handleErrorResponse(response))
      .finally(() => motd.isMarking = false);
  }
}

