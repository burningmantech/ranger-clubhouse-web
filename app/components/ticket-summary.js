import Component from '@glimmer/component';
import {cached} from '@glimmer/tracking';
import {htmlSafe} from '@ember/template';
import dayjs from 'dayjs';

export default class TicketSummaryComponent extends Component {
  @cached
  get summaryTitle() {
    if (this.unfinishedItems.length) {
      return 'Summary - Unfinished Items';
    } else {
      return 'Summary';
    }
  }

  @cached
  get unfinishedItems() {
    const items = [];
    const {ticketPackage} = this.args;

    if (ticketPackage.tickets.find((ad) => (ad.isTicket && ad.isQualified))) {
      items.push('The event ticket(s) has to be claimed or banked.')
    } /*else if (!this.haveAddress) {
      items.push('A delivery method and/or a mailing address has not been given.');
    }*/

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

    pkg.provisions.filter((t) => t.isBanked).forEach((t) => {
      banked.push(`${t.typeLabel} (expires ${dayjs(t.expiry_date).format('YYYY-MM-DD')})`);
    });

    return banked;
  }

  @cached
  get claimedItems() {
    const pkg = this.args.ticketPackage;
    const {ticket, person} = this.args;
    const vp = pkg.vehiclePass;
    const claimed = [];

    if (ticket && ticket.isClaimed) {
      claimed.push(htmlSafe(`A ${ticket.typeLabel}${this.itemDeliveryMethod(ticket)}`));
    }

    if (vp && vp.isClaimed) {
      claimed.push(htmlSafe(`A ${vp.typeLabel} ${this.itemDeliveryMethod(vp)}`));
    }

    const wap = pkg.wap;
    if (this.hasStaffCredential || (wap && wap.isClaimed)) {
      let text = 'A Work Access Pass for yourself<ul class="mb-0">';
      if (this.hasStaffCredential) {
        text += '<li>Part of your Staff Credential - no additional document needed.</li>';
      }

      if (!this.hasStaffCredential) {
        text += `<li>sent via email to ${person.email}</li>`;
      }
      const accessItem = this.hasStaffCredential ? ticket : wap;
      if (accessItem.access_any_time) {
        text += '<li>Allows entry ANY time</li>';
      } else if (accessItem.access_date) {
        text += `<li>Allows entry on or after ${dayjs(accessItem.access_date).format('ddd MMM D')} @ 00:01<br>Entry prior to this time is prohibited. No exceptions!</li>`;
      } else {
        text += `<li><b class="text-danger">No access date is on file. Contact the ticketing team to fix this!</b></li>`;
      }
      text += '</ul>';
      claimed.push(htmlSafe(text));
    }

    const {wapso} = pkg;
    if (wapso && wapso.find((w) => w.isClaimed)) {
      const names = wapso.filter((w) => w.isClaimed).map((w) => w.name).join(', ');
      let text = `${wapso.length} Work Access Pass${wapso.length > 1 ? 'es' : ''} for Significant Others<ul class="mb-0">`;
      text += `<li>sent via email to ${person.email}</li>`;
      text += `<li>Allows entry on ${dayjs(wapso[0].access_date).format('ddd MMM D')} @ 00:01</li>`;
      text += `<li>for ${names}</li></ul>`;
      claimed.push(htmlSafe(text));
    }

    if (pkg.jobItems) {
      pkg.jobItems.forEach((j) => claimed.push(j.typeLabelWithCounts));
    } else {
      pkg.provisions.filter((t) => (t.isQualified || t.isClaimed)).forEach((t) => {
        claimed.push(t.typeLabelWithCounts);
      });
    }

    return claimed;
  }

  get hasStaffCredential() {
    const {ticket} = this.args;

    return (ticket && ticket.isStaffCredential && ticket.isClaimed);
  }

  @cached
  get submittedItems() {
    return this.args.ticketPackage.accessDocuments.filter((ad) => ad.isSubmitted).map((ad) => ad.typeLabel);
  }

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
      unclaimed.push(`No Work Access Pass for yourself`);
    }

    const wapso = pkg.wapso;
    if (!wapso || !wapso.length) {
      unclaimed.push('No Work Access Passes for Significant Others');
    }

    return unclaimed;
  }

  itemDeliveryMethod(item) {
    const {person} = this.args;
    if (item.isTicket || item.isVehiclePass) {
      let invoice = '';
      if (item.isReducedPriceTicket) {
        invoice = '<li>Ticket must be paid for - an invoice will be sent</li>'
      }
      if (!item.isStaffCredential && item.isDeliveryPostal) {
        return `<ul class="mb-0">${invoice}<li>Will be delivered by mail -- delivery address will be collected later.</li></ul>`;
      }
      return `<ul class="mb-0">${invoice}<li>Held at ${item.isStaffCredential ? 'Staff Credentialing' : 'Will-Call'} under your name <span class="d-inline-block">"${person.first_name} ${person.last_name}"</span>`;
    }

    if (item.isWAP || item.isWAPSO) {
      return `<ul class="mb-0"><li>sent via email to ${person.email}</li></ul>`;
    }

    return '';
  }
}
