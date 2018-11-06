import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';

export default class PersonSidebarComponent extends Component {
  @argument person;
}
