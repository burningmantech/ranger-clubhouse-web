import { helper } from '@ember/component/helper';
import { typeOf } from '@ember/utils'

export default helper(function optionsGet([ options, lookupValue ]/*, hash*/) {
  let foundLabel;
  options.some((opt) => {
    const type = typeOf(opt);
    let label, value;

    if (type == 'object' && ("id" in opt)) {
      label = opt.title
      value = opt.id
    // Simple [ 'label', value ]
    } else if (type == 'array') {
      label = opt[0];
      value = opt[1];
    } else {
      // Or just [  value ]
      label = value = opt;
    }

    if (value == lookupValue) {
      foundLabel = label;
      return true;
    }

    return false;
  });

  if (foundLabel) {
    return foundLabel;
  }

  return lookupValue;
});
