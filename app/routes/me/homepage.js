import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {setting} from "clubhouse/utils/setting";

export default class MeHomepageRoute extends ClubhouseRoute {
  async model() {
    const user = this.session.user;
    const data = {};

    data.bullentins = await this.ajax.request('motd/bulletin', {data: {type: 'unread', page_size: 100}});
    data.milestones = (await this.ajax.request(`person/${user.id}/milestones`)).milestones;
    if (!user.isPastProspective && !user.isAuditor) {
      // Auditors and past prospectives do not have agreements.
      data.agreements = (await this.ajax.request(`agreements/${user.id}`)).agreements;
    }
    return data;

  }

  setupController(controller, model) {
    const bullentins = model.bullentins;
    const {user} = this.session;

    if ((user.isRanger || user.isEchelon) && !!setting('EventManagementOnPlayaEnabled')) {
      controller.set('signinPositions', user.role_signin_positions);
    } else {
      controller.set('signinPositions', null);
    }

    controller.set('person', this.modelFor('me'));
    controller.set('photo', model.milestones.photo);
    controller.set('motds', bullentins.motd);
    controller.set('motdsMeta', bullentins.meta.total);
    controller.set('milestones', model.milestones);
    controller.set('showUploadDialog', false);
  }
}
