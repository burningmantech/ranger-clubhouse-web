import {helper} from '@ember/component/helper';
import {htmlSafe} from '@ember/template';
import {parsePhoneNumberFromString, ParseError} from 'libphonenumber-js'

export function phoneLink([number]) {
  let phoneURI, phoneFormatted;

  try {
    const normalized = number.replace(/[^\w]+/g, '');
    const phone = parsePhoneNumberFromString(number, (normalized.length === 10 || (normalized.length === 11 && normalized.substr(0,1) === '1'))  ? 'US' : undefined);
    if (phone) {
      if (phone.country === 'US') {
        phoneFormatted = phone.formatNational();
      } else {
        phoneFormatted = phone.formatInternational();
      }
      phoneURI = phone.getURI();
    } else {
      phoneFormatted = number;
      phoneURI = `tel:${number}`;
    }
  } catch (error) {
    if (error instanceof ParseError) {
     phoneFormatted = number;
     phoneURI = `tel:${number}`;
    } else {
      throw error;
    }
  }

  return htmlSafe(`<a href="${phoneURI}">${phoneFormatted}</a>`)
}

export default helper(phoneLink);
