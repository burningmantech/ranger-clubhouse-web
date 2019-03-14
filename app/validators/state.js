import { isEmpty } from '@ember/utils';

const CountriesWithStates = [ 'US', 'CA', 'AU' ];
function getProperty(changes, content, name) {
  return changes.hasOwnProperty(name) ? changes[name] : content.get(name);
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
