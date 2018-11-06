import { helper } from '@ember/component/helper';
import { htmlSafe } from '@ember/string';

export function phoneLink([ phone ]) {
    return htmlSafe(`<a href="tel:${phone}">${phone}</a>`)
}

export default helper(phoneLink);
