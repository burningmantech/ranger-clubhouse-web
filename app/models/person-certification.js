import Model, {attr} from '@ember-data/model';

export default class PersonCertificationModel extends Model {
  @attr('number') person_id;
  @attr('number', {readOnly: true}) recorder_id;
  @attr('', {readOnly: true}) recorder;
  @attr('number') certification_id;
  @attr('', {readOnly: true}) certification;
  @attr('string') card_number;
  @attr('string') issued_on;
  @attr('string') trained_on;


  @attr('string') notes;
}
