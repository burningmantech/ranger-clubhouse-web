import Component from '@glimmer/component';
import {cached} from '@glimmer/tracking';
import {htmlSafe} from '@ember/template';
import dayjs from 'dayjs';
import {DELIVERY_POSTAL, DELIVERY_PRIORITY, DELIVERY_WILL_CALL} from 'clubhouse/models/access-document';

export default class TicketSummaryComponent extends Component {
  /**
   * Return a list of unfinished items:
   * - Any qualified ticket (multiple tickets will be either be claimed or banked by the first step)
   * - Delivery method was not chosen for SPT.
   *
   * @returns {*[]}
   */

  @cached
  get unfinishedItems() {
    const items = [];
    const {ticketPackage} = this.args;

    if (ticketPackage.tickets.find((ad) => (ad.isRegularTicket && ad.isQualified))) {
      items.push('The event ticket(s) has to be claimed or banked.')
    } /*else if (!this.haveAddress) {
      items.push('A delivery method and/or a mailing address has not been given.');
    }*/

    const {ticket} = this.args;
    const {vehiclePass} = this.args.ticketPackage;

    const item = ticket ?? vehiclePass;
    if (item && item.isUsing && item.isDeliveryNone) {
      items.push('A delivery method still needs to be chosen.');
    }

    return items;
  }

  /**
   * Was the address given?
   *
   * @returns {boolean|*}
   */

  get haveAddress() {
    return this.args.ticketPackage.haveAddress;
  }

  /**
   * Build up all banked items (tickets & provisions)
   *
   * @returns {*[]}
   */

  @cached
  get bankedItems() {
    const banked = [];

    const pkg = this.args.ticketPackage;

    pkg.tickets.filter((t) => t.isBanked).forEach((t) => {
      banked.push({
        name: `A ${t.typeLabel}`,
        expires: dayjs(t.expiry_date).format('YYYY-MM-DD'),
      });
    });

    if (pkg.provisionsBanked) {
      pkg.provisionItems.forEach((item) => {
        banked.push({
          name: item.name,
          expires: item.expires
        });
      });
    }

    return banked;
  }

  /**
   * Build up all claimed items.
   *
   * @returns {*[]}
   */
  @cached
  get claimedItems() {
    const pkg = this.args.ticketPackage;
    const {ticket} = this.args;
    const vp = pkg.vehiclePass;
    const claimed = [];

    if (ticket && ticket.isClaimed) {
      claimed.push(htmlSafe(`A ${ticket.typeLabel}`));
    }

    pkg.giftTickets.forEach((ticket) => {
      if (ticket.isClaimed) {
        claimed.push(htmlSafe(`A ${ticket.typeLabel}`));
      }
    });

    if (vp && vp.isClaimed) {
      claimed.push(htmlSafe(`A ${vp.typeLabel}`));
    }

    const wap = pkg.wap;
    if (this.hasStaffCredential || (wap && wap.isClaimed)) {
      const lines = [];
      if (this.hasStaffCredential) {
        lines.push('Part of your Staff Credential - no additional document needed.');
      }

      const text = lines.map((l) => `<div class="ms-1">${l}</div>`).join('');
      claimed.push(htmlSafe(`A Setup Access Pass for yourself<br>${text}`));
    }

    const {wapso} = pkg;
    if (wapso && wapso.find((w) => w.isClaimed)) {
      let text = `${wapso.length} Setup Access Pass${wapso.length > 1 ? 'es' : ''} for Significant Others`;
      claimed.push(htmlSafe(text));
    }

    if (!pkg.provisionsBanked) {
      pkg.provisionItems.forEach((item) => {
        claimed.push(item.name);
      });
    }

    return claimed;
  }

  /**
   * Build up a list of submitted items. (rare condition)
   *
   */

  @cached
  get submittedItems() {
    return this.args.ticketPackage.accessDocuments.filter((ad) => ad.isSubmitted).map((ad) => ad.typeLabel);
  }

  /**
   * Build up a list of unclaimed items.
   *
   * @returns {*[]}
   */

  @cached
  get unclaimedItems() {
    const pkg = this.args.ticketPackage;
    const vp = pkg.vehiclePass;
    const unclaimed = [];

    if (vp && !vp.isClaimed) {
      unclaimed.push('No Vehicle Pass to allow driving into the event.');
    }

    const wap = pkg.wap;
    if (!this.hasStaffCredential && (!wap || !wap.isClaimed)) {
      unclaimed.push(`No Setup Access Pass for yourself`);
    }

    const wapso = pkg.wapso;
    if (!wapso || !wapso.length) {
      unclaimed.push('No Setup Access Passes for Significant Others');
    }

    return unclaimed;
  }

  get hasStaffCredential() {
    const {ticket} = this.args;
    return ticket && ticket.isStaffCredential && ticket.isClaimed;
  }
}
