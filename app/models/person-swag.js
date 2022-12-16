import Model, {attr} from '@ember-data/model';
import {TYPE_DEPT_SHIRT, ShirtTypeLabels, TypeLabels} from 'clubhouse/models/swag';

export default class PersonSwagModel extends Model {
  @attr('number') person_id;
  @attr('number') swag_id;
  @attr('string') notes;
  @attr('number') year_issued;
  @attr('date', {readOnly: true}) created_at;
  @attr('date', {readOnly: true}) updated_at;

  @attr('', {readOnly: true}) swag;

  get swagTitle() {
    return this.swag.type === TYPE_DEPT_SHIRT ? `${this.swag.title} (${ShirtTypeLabels[this.swag.shirt_type]})` : this.swag.title;
  }

  get swagTypeLabel() {
    return TypeLabels[this.swag.type];
  }
}
