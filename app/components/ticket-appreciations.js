import Component from '@glimmer/component';
import { htmlSafe } from '@ember/string';

export default class TicketAppreciationsComponent extends Component {
  constructor() {
    super(...arguments);

    this.items = this.args.ticketPackage.appreciations;
  }

  get titleCounts() {
    const titles = [];

    if (this.qualifiedCount) {
      titles.push(`<span class="text-success">${this.qualifiedCount} Available</span>`);
    }

    if (this.bankedCount) {
      titles.push(`<span class="text-muted">${this.bankedCount} Banked</span>`);
    }

    if (this.claimedCount) {
      titles.push(`<span class="text-success">${this.claimedCount} Claimed <i class="fas fa-check"></i>`);
    }

    return htmlSafe(titles.join(', '));
  }

  get qualifiedCount() {
    return this.items.filter((i) => i.isQualified).length;
  }

  get claimedCount() {
    return this.items.filter((i) => i.isClaimed).length;
  }

  get bankedCount() {
    return this.items.filter((i) => i.isBanked).length;
  }
}
