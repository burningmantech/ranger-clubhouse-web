import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {
  SHIRT_LONG_SLEEVE,
  SHIRT_T_SHIRT,
  TYPE_DEPT_PATCH,
  TYPE_DEPT_PIN,
  TYPE_DEPT_SHIRT,
  TYPE_ORG_PATCH
} from "clubhouse/models/swag";

export default class ReportsSwagDistributionRoute extends ClubhouseRoute {
  queryParams = {
    year: {refreshModel: true}
  };

  model({year}) {
    this.year = year ?? this.house.currentYear();
    const data = {};
    if (this.year !== 'All') {
      data.year = this.year;
    }
    return this.ajax.request('person-swag/distribution', {data});
  }

  setupController(controller, {people}) {
    controller.year = this.year;
    controller.people = people;

    people.forEach((person) => {
      person.tshirts = [];
      person.longSleeveShirt = [];
      person.servicePins = [];
      person.servicePatches = [];
      person.orgPatches = [];
      person.toasterPins = [];
      person.other = [];

      person.items.forEach((item) => {
        switch (item.type) {
          case TYPE_DEPT_SHIRT:
            if (item.shirt_type === SHIRT_T_SHIRT) {
              person.tshirts.push(item);
            } else if (item.shirt_type === SHIRT_LONG_SLEEVE) {
              person.longSleeveShirt.push(item);
            } else {
              person.other.push(item);
            }
            break;

          case TYPE_DEPT_PIN:
            if (item.title.match(/toaster/i)) {
              person.toasterPins.push(item);
            } else {
              person.servicePins.push(item);
            }
            break;

          case TYPE_DEPT_PATCH:
            person.servicePatches.push(item);
            break;

          case TYPE_ORG_PATCH:
            person.orgPatches.push(item);
            break;

          default:
            person.other.push(item);
            break;
        }
      })
    });
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.year = null;
    }
  }
}
