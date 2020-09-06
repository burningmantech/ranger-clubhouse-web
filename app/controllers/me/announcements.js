import Controller from '@ember/controller';
import {action, set} from '@ember/object';

export default class MeAnnouncementsController extends Controller {
  @action
  toggleMotd(motd) {
    this.motds.forEach((m) => {
      set(m, 'showing', (motd.id == m.id) ? !motd.showing : false);
      $(`#motd-text-${motd.id}`).collapse(m.showing ? 'show' : 'hide');
    });
  }

  @action
  markMotdAsRead(motd) {
    set(motd, 'isMarking', true);
    this.ajax.request(`motd/${motd.id}/markread`, {method: 'POST'})
      .then(() => {
        set(motd, 'showing', false);
        set(motd, 'has_read', true);
        $(`#motd-text-${motd.id}`).collapse('hide');
        this.toast.success('Announcement marked as read.');
      }).catch((response) => this.house.handleErrorResponse(response))
      .finally(() => set(motd, 'isMarking', false));
  }
}
