import Controller from '@ember/controller';
import {action, computed, set} from '@ember/object';

export default class MeAnnouncementsController extends Controller {
  @action
  toggleMotd(motd) {
    this.motds.forEach((m) => {
      set(m, 'showing', (motd.id == m.id) ? !motd.showing : false);
    });
  }

  @action
  showFirstUnread() {
    let motd = this.motds.find((m) => !m.has_read);
    if (!motd) {
      motd = this.motds[0];
    }

    this.house.scrollToElement(`#motd-${motd.id}`);
    set(motd, 'showing', true);
  }

  @computed('motds.@each.has_read')
  get unreadCount() {
    let unread = 0;
    this.motds.forEach((m) => {
      if (!m.has_read) {
        unread++;
      }
    });
    return unread;
  }

  @action
  markMotdAsRead(motd) {
    set(motd, 'isMarking', true);
    this.ajax.request(`motd/${motd.id}/markread`, {method: 'POST'})
      .then(() => {
        set(motd, 'showing', false);
        set(motd, 'has_read', true);
        this.toast.success('Announcement marked as read.');
        const unread = this.motds.find((m) => !m.has_read);
        if (unread) {
          this.house.scrollToElement(`#motd-${unread.id}`);
          set(unread, 'showing', true);
        }
      }).catch((response) => this.house.handleErrorResponse(response))
      .finally(() => set(motd, 'isMarking', false));
  }

}
