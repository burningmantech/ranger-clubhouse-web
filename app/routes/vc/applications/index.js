import ClubhouseRoute from "clubhouse/routes/clubhouse-route";
import {VOLUNTEER_COORDINATOR} from "clubhouse/constants/positions";

export default class VcApplicationsIndexRoute extends ClubhouseRoute {
  queryParams = {
    year: {refreshModel: true}
  }

  async model({year}) {
   if (!year) {
      year = this.house.currentYear();
    } else {
      year = +year;
    }

    const yearDidChange = (this.oldYear && this.oldYear !== year);
    this.oldYear = year;
    return {
      applications: await this.store.query('prospective-application', {year}),
      VCs: (await this.ajax.request(`position/${VOLUNTEER_COORDINATOR}/grants`)).people,
      year,
      yearDidChange
    };
  }

  setupController(controller, model) {
    controller.applications = model.applications;
    controller.year = model.year;
    controller.VCs = model.VCs;
    if (model.yearDidChange) {
      this._resetFilters(controller);
    }
  }

/*  resetController(controller, isExiting) {
    if (isExiting) {
      this._resetFilters(controller);
    }
  }*/

  _resetFilters(controller) {
    controller.assignedToFilter = 'all';
    controller.nameFilter = 'all';
    controller.statusFilter = 'pending';
    controller.ageFilter = 'all';
    controller.experienceFilter = 'all';
  }
}
