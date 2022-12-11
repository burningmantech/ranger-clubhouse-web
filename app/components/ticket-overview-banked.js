import Component from '@glimmer/component';
import dayjs from 'dayjs';

export default class TicketOverviewBankedComponent extends Component {
  constructor() {
    super(...arguments);

    const pkg = this.args.ticketPackage;

    this.bankedItems = [];
    pkg.tickets.forEach((t) => {
      if (t.isBanked) {
        this.bankedItems.push({name: `A ${t.typeLabel}`, expires: dayjs(t.expiry_date).format('YYYY-MM-DD')});
      }
    });

    if (pkg.provisionsBanked) {
      pkg.provisionItems.forEach((p) => {
        this.bankedItems({name: p.name, expires: p.expires});
      })
    }
  }
}
