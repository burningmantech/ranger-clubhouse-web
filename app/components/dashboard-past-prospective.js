import Component from '@glimmer/component';

export default class DashboardPastProspectiveComponent extends Component {
  constructor() {
    super(...arguments);

    this.year = (new Date()).getFullYear();
  }
}
