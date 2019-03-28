import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';
import { unionOf } from '@ember-decorators/argument/types';

export default class AssetTableComponent extends Component {
  @argument('object') assets;
  @argument('object') onCheckIn;
  @argument(unionOf('string', 'number')) year;
}
