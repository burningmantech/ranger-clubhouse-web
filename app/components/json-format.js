import Component from '@glimmer/component';
import { action } from '@ember/object';

import JSONFormatter from 'json-formatter-js'

export default class JsonFormatComponent extends Component {
  json = null;

  constructor() {
    super(...arguments);

    let obj = this.args.json;

    if (typeof obj == 'string') {
      try {
        obj = JSON.parse(obj);
      } catch {
        //ignore the exception
      }
    }

    this.json = obj;
  }

  @action
  componentInserted(element) {
    const formatter = new JSONFormatter(this.json, 0, {
      animateOpen: false,
      animateClose: false,
    });
    element.appendChild(formatter.render());
  }
}
