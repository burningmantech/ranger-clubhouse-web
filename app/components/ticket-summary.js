import Component from '@glimmer/component';
import {cached} from '@glimmer/tracking';
import {htmlSafe} from '@ember/template';
import dayjs from 'dayjs';

export default class TicketSummaryComponent extends Component {
  @cached
  get unfinishedItems() {
    const items = [];
    const {ticketPackage} = this.args;

    if (ticketPackage.tickets.find((ad) => (ad.isTicket && ad.isQualified))) {
      items.push('The event ticket(s) has to be claimed or banked.')
    } else if (!this.haveAddress) {
      items.push('A delivery method and/or a mailing address has not been given.');
    }

    const appreciations = ticketPackage.appreciations.filter((a) => (a.isQualified && !a.isEventRadio));
    if (appreciations.length) {
      items.push(`${appreciations.length} appreciation(s) has to be claimed or banked.`);
    }

    return items;
  }

  get haveAddress() {
    return this.args.ticketPackage.haveAddress;
  }

  @cached
  get bankedItems() {
    const banked = [];

    const pkg = this.args.ticketPackage;

    pkg.tickets.filter((t) => t.isBanked).forEach((t) => {
      banked.push(`A ${t.typeLabel} (expires ${dayjs(t.expiry_date).format('YYYY-MM-DD')})`);
    });

    pkg.appreciations.filter((t) => t.isBanked).forEach((t) => {
      banked.push(`${t.typeLabel} (expires ${dayjs(t.expiry_date).format('YYYY-MM-DD')})`);
    });

    return banked;
  }

  @cached
  get claimedItems() {
    const pkg = this.args.ticketPackage;
    const {ticket, person} = this.args;
    const vp = pkg.vehicle_pass;
    const claimed = [];

    if (ticket && ticket.isClaimed) {
      claimed.push(htmlSafe(`A ${ticket.typeLabel}${this.itemDeliveryMethod(ticket)}`));
    }

    if (vp && vp.isClaimed) {
      claimed.push(htmlSafe(`A ${vp.typeLabel} ${this.itemDeliveryMethod(vp)}`));
    }

    const wap = pkg.wap;
    if (this.hasStaffCredential || (wap && wap.isClaimed)) {
      let text = 'A Work Access Pass for yourself<ul>';
      if (this.hasStaffCredential) {
        text += '<li>Part of your Staff Credential - no additional document needed.</li>';
      }

      if (!this.hasStaffCredential) {
        text += `<li>sent via email to ${person.email}</li>`;
      }
      const accessItem = this.hasStaffCredential ? ticket : wap;
      if (accessItem.access_any_time) {
        text += '<li>Allows entry any time</li>';
      } else {
        text += `<li>Allows entry on ${dayjs(accessItem.access_date).format('ddd MMM D')} @ 00:01</li>`;
      }
      text += '</ul>';
      claimed.push(htmlSafe(text));
    }

    const {wapso} = pkg;
    if (wapso && wapso.find((w) => w.isClaimed)) {
      const names = wapso.filter((w) => w.isClaimed).map((w) => w.name).join(', ');
      let text = `${wapso.length} Work Access Pass${wapso.length > 1 ? 'es' : ''} for Significant Others<ul>`;
      text += `<li>sent via email to ${person.email}</li>`;
      text += `<li>Allows entry on ${dayjs(wapso[0].access_date).format('ddd MMM D')} @ 00:01</li>`;
      text += `<li>for ${names}</li></ul>`;
      claimed.push(htmlSafe(text));
    }

    pkg.appreciations.filter((t) => t.isClaimed).forEach((t) => {
      claimed.push(t.typeLabel);
    });

    return claimed;
  }

  get hasStaffCredential() {
    const {ticket} = this.args;

    return (ticket && ticket.isStaffCredential && ticket.isClaimed);
  }

  itemDeliveryMethod(item) {
    const {person} = this.args;
    if (item.isTicket || item.isVehiclePass) {
      let invoice = '';
      if (item.isReducedPriceTicket) {
        invoice = '<li>Ticket must be paid for - an invoice will be sent</li>'
      }
      const {delivery} = this.args.ticketPackage;
      if (!item.isStaffCredential && delivery.isDeliveryPostal) {
        return `<ul>${invoice}<li>Mailed to:<br>${delivery.street}<br>${delivery.city}, ${delivery.state} ${delivery.postal_code} ${delivery.country}</li></ul>`;
      }
      return `<ul>${invoice}<li>held at ${item.isStaffCredential ? 'Staff Credentialing' : 'Will-Call'} under your name <span class="d-inline-block">"${person.first_name} ${person.last_name}"</span>`;
    }

    if (item.isWAP || item.isWAPSO) {
      return `<ul><li>sent via email to ${person.email}</li></ul>`;
    }

    return '';
  }

  @cached
  get unclaimedItems() {
    const pkg = this.args.ticketPackage;
    const vp = pkg.vehicle_pass;
    const unclaimed = [];

    if (vp && !vp.isClaimed) {
      unclaimed.push(`A Vehicle Pass was not claimed`);
    }

    const wap = pkg.wap;
    if (!this.hasStaffCredential && (!wap || !wap.isClaimed)) {
      unclaimed.push(`No Work Access Pass for yourself`);
    }

    const wapso = pkg.wapso;
    if (!wapso || !wapso.length) {
      unclaimed.push('No Work Access Passes for Significant Others');
    }

    const radio = pkg.appreciations.find((a) => a.isEventRadio && a.isQualified);
    if (radio) {
      unclaimed.push('Event Radio');
    }

    return unclaimed;
  }
}
