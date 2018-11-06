import { helper } from '@ember/component/helper';
import { htmlSafe } from '@ember/string';

const topicDescription = {
    ticket: 'Ticketing',
    vp: 'Vehicle Pass',
    wap: 'Work Access Pass',
    alpha: 'Work Access Passes for Prospectives and Alphas'
};

export function ticketFaq([ topic, ticketingInfo ]/*, hash*/) {
  const description = topicDescription[topic];

  if (ticketingInfo && ticketingInfo.faqs && ticketingInfo.faqs[topic]) {
    const url = ticketingInfo.faqs[topic];
    return htmlSafe(`<p class="mt-3">Questions? Check out the <a target="_blank" href="${url}">${description} FAQ</a> (opens in a new window).</p>`);

  }
  return '';
}

export default helper(ticketFaq);
