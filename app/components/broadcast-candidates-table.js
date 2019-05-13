/*
 * Show who a RBS broadcast might reach
 */
 
import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';

export default class BroadcastCandidatesTableComponent extends Component {
  @argument('object') people;
}
