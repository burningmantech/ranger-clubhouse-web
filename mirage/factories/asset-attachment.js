import { Factory } from 'miragejs';

export default Factory.extend({
  parent_type: 'radio',

  description(i) {
    return `Attachment ${i + 1}`;
  }
});
