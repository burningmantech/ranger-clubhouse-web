import Model, {attr} from '@ember-data/model';

export default class OauthClientModel extends Model {
  @attr('string') client_id;
  @attr('string') description;
  @attr('string') secret;
  @attr('string',  { readOnly: true }) updated_at;
  @attr('string',  { readOnly: true }) created_at;
}
