import ClubhouseRoute from "../../clubhouse-route";

export default class VcAccessDocumentsEarlyArrivalRoute extends ClubhouseRoute {
  model() {
    return this.ajax.request('access-document/early-arrival');
  }

  setupController(controller, model) {
    controller.status = model.status;
    controller.arrivals = model.arrivals;
    controller.date = model.date;
  }
}
