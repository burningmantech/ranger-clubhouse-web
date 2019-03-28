import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';
import JSONFormatter from 'json-formatter-js'

export default class JsonFormatComponent extends Component {
  @argument('any') json;

  didInsertElement() {
    super.didInsertElement(...arguments);

    const formatter = new JSONFormatter(JSON.parse(this.json), 1, {
      animateOpen: false,
      animateClose: false,
    });
    this.element.appendChild(formatter.render());
  }
}
