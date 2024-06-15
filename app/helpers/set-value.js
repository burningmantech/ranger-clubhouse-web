import { helper } from '@ember/component/helper';
import { set } from '@ember/object';

export default helper(function setValue([obj, name]) {
  return (value) => {
    set(obj, name, value);
  };
});
