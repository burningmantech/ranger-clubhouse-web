import Component from '@glimmer/component';
import {action} from '@ember/object';
import {service} from '@ember/service';
import {tracked} from '@glimmer/tracking';
import {htmlSafe} from '@ember/template';

class Motd {
  @tracked showing = false;
  @tracked has_read = false;
  @tracked isMarking = false;

  constructor(motd) {
    Object.assign(this, motd);
    this.message = htmlSafe(this.message);
  }
}

export default class MeMotd extends Component {
  @service ajax;
  @service toast;
  @service house;

  @tracked motds;
  @tracked showMotdDialog = false;
  @tracked motd = null;

  constructor() {
    super(...arguments);

    this.motds = this.args.motds.map((m) => new Motd(m));
  }

  @action
  viewMotd(motd) {
    this.motd = motd;
    this.showMotdDialog = true;
  }

  @action
  closeMotdDialog() {
    this.showMotdDialog = false;
  }

  @action
  async markAsRead() {
    const {motd} = this;
    try {
      motd.isMarking = true;
      await this.ajax.post(`motd/${motd.id}/markread`);
      motd.showing = false;
      motd.has_read = true;
      this.toast.success('Announcement marked as read.');
    } catch (response) {
      this.house.handleErrorResponse(response)
    } finally {
      motd.isMarking = false;
    }
  }

}
