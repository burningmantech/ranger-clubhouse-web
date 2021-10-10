import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action, set} from '@ember/object';
import bootstrap from 'bootstrap';

export default class MeAnnouncementsController extends ClubhouseController {
  @action
  toggleMotd(motd) {
    this.motds.forEach((m) => {
      set(m, 'showing', (+motd.id === +m.id) ? !motd.showing : false);
      this._collapseMotd(m, m.showing ? 'show' : 'hide');
    });
  }

  @action
  markMotdAsRead(motd) {
    set(motd, 'isMarking', true);
    this.ajax.request(`motd/${motd.id}/markread`, {method: 'POST'})
      .then(() => {
        set(motd, 'showing', false);
        set(motd, 'has_read', true);
        this._collapseMotd(motd, 'hide');
        this.toast.success('Announcement marked as read.');
      }).catch((response) => this.house.handleErrorResponse(response))
      .finally(() => set(motd, 'isMarking', false));
  }

  _collapseMotd(motd, action) {
    const element = document.getElementById(`motd-text-${motd.id}`);
    const collapse = bootstrap.Collapse.getOrCreateInstance(element, { toggle: false});

    if (action === 'show') {
      collapse.show();
    } else {
      collapse.hide();
    }
  }
}
