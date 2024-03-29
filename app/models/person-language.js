import Model, {attr} from '@ember-data/model';

export const PROFICIENCY_UNKNOWN = 'unknown';
export const PROFICIENCY_BASIC = 'basic';
export const PROFICIENCY_INTERMEDIATE = 'intermediate';
export const PROFICIENCY_FLUENT = 'fluent';

export const LANGUAGE_CUSTOM = 'custom';

export const ProficiencyLabels = {
  [PROFICIENCY_UNKNOWN]: 'Not Stated',
  [PROFICIENCY_BASIC]: 'Basic',
  [PROFICIENCY_INTERMEDIATE]: 'Intermediate',
  [PROFICIENCY_FLUENT]: 'Fluent',
};

export const ProficiencyOptions = [
  ['Not Stated', PROFICIENCY_UNKNOWN],
  ['Basic: You can answer basic questions using some common phrases and words.', PROFICIENCY_BASIC],
  ['Intermediate: You can hold a causal conversation.', PROFICIENCY_INTERMEDIATE],
  [ 'Fluent/Native: You can have an in-depth conversation.', PROFICIENCY_FLUENT]
]

export default class PersonLanguageModel extends Model {
  @attr('number') person_id;
  @attr('string') language_name;
  @attr('string') language_custom;
  @attr('string', {defaultValue: PROFICIENCY_UNKNOWN}) proficiency;

  get actualName() {
    return this.language_name === LANGUAGE_CUSTOM ? this.language_custom : this.language_name;
  }

  get haveProficiency() {
    return this.proficiency !== PROFICIENCY_UNKNOWN;
  }

  get proficiencyLabel() {
    if (this.proficiency === PROFICIENCY_UNKNOWN) {
      return '-';
    }
    return ProficiencyLabels[this.proficiency] ?? `Unknown: ${this.proficiency}`;
  }
}
