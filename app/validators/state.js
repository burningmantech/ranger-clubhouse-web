import { isEmpty } from '@ember/utils';
import { get } from '@ember/object';

const CountriesWithStates = [ 'US', 'CA', 'AU' ];

function getProperty(changes, content, name) {
  return (name in changes) ? changes[name] : get(content, name);
}

export default function validateState(/* options = {} */) {
  return (key, newValue, oldValue, changes, content) => {
      const country = getProperty(changes, content, 'country');

      if (isEmpty(country)) {
        return 'Select a country';
      }

      if (CountriesWithStates.includes(country) && isEmpty(newValue)) {
        switch (country) {
          case 'US':
            return 'Select a state';
          case 'CA':
            return 'Select a province';
          default:
            return 'Select a state/territory';
        }
      }

      return true;
  };
}
