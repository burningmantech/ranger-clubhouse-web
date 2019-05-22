import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';

export default class PrintInstructionComponent extends Component {
  @argument('object') backAction;
  @argument('string') backLabel;
}
