import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class MentorAcceptanceSheetsRoute extends ClubhouseRoute {
  model() {
    return this.ajax.request('mentor/alphas');
  }

  setupController(controller, model) {
    const alphas = model.alphas;

    alphas.forEach((a) => a.selected = true);
    controller.set('alphas', alphas);
    controller.set('filter', 'all');
    controller.set('selectAll', true);
    controller.set('year', this.house.currentYear());
    controller.set('isPrinting', false);
    controller._buildViewAlphas();
    controller._buildPrintAlphas();
  }
}
