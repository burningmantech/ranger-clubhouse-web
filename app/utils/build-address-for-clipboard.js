import { isEmpty } from '@ember/utils';

export default function buildAddressForClipboard(person) {
  let address = `${person.first_name} ${person.last_name}\n${person.street1}`;

  if (!isEmpty(person.apt)) {
    address += ` ${person.apt}`;
  }

  address += "\n";
  if (!isEmpty(person.street2)) {
    address += `${person.street2}\n`;
  }
  address += `${person.city}, ${person.state} ${person.zip} ${person.country}\n`;

  return address;
}
