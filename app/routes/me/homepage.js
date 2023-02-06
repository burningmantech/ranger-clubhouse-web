import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class MeHomepageRoute extends ClubhouseRoute {
  async model() {
    const user = this.session.user;

    const data = {};

    data.bullentins = await this.ajax.request('motd/bulletin', {data: {type: 'unread', page_size: 100}});
    data.milestones = await this.ajax.request(`person/${user.id}/milestones`).then((result) => result.milestones);
    data.years = await this.ajax.request(`person/${user.id}/years`);

    // Auditors and past prospectives do no have photos
    if (!user.isPastProspective && !user.isAuditor) {
      data.photo = await this.ajax.request(`person/${user.id}/photo`).then(({photo}) => photo);
      data.agreements = await this.ajax.request(`agreements/${user.id}`).then(({agreements}) => agreements);
    }

    return data;
  }

  setupController(controller, model) {
    const bullentins = model.bullentins;
    controller.set('person', this.modelFor('me'));
    controller.set('photo', model.photo);
    controller.set('motds', bullentins.motd);
    controller.set('motdsMeta', bullentins.meta.total);
    controller.set('milestones', model.milestones);
    controller.set('years', model.years);
    controller.set('showUploadDialog', false);
  }
}
