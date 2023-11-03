import Model, {attr} from '@ember-data/model';

export default class PositionLineupModel extends Model {
  @attr('string') description;
  @attr('', { readOnly: true }) positions;
  @attr('') position_ids;
}
