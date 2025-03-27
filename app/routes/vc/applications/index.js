import ClubhouseRoute from "clubhouse/routes/clubhouse-route";
import {VOLUNTEER_COORDINATOR} from "clubhouse/constants/positions";

import {FILTERS_KEY, FILTERS_VALUES} from "clubhouse/controllers/vc/applications/index";
import {forEach} from 'lodash';

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
    const existingValues = this.house.getKey(FILTERS_KEY) || {};
    const newValues = {};
    console.log("* FILTER VALUES", FILTERS_VALUES);
    forEach(FILTERS_VALUES, (value, key) => {
      if (model.yearDidChange) {
        newValues[key] = value;
      } else {
        newValues[key] = existingValues[key] || value;
      }

      controller[key] = newValues[key];
      console.log(`* KEY [${key}] -> [${newValues[key]}]`);
    });

    this.house.setKey(FILTERS_KEY, newValues);
  }
}
