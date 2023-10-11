import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {dasherize} from '@ember/string';
import {action} from '@ember/object';
import {cached, tracked} from '@glimmer/tracking';
import {HandleConflict} from 'clubhouse/utils/handle-conflict';
import {
  AmericanSoundexRule,
  DoubleMetaphoneRule,
  EditDistanceRule,
  ExperimentalEyeRhymeRule,
  EyeRhymeRule,
  MinLengthRule,
  PhoneticAlphabetRule,
  SubstringRule
} from 'clubhouse/utils/handle-rules';
import { ReservationTypeLabels } from 'clubhouse/models/handle-reservation';

let nextCheckId = 1;

class CheckedHandle {
  constructor(obj) {
    Object.assign(this, obj);
  }

  get conflicts() {
    const enabledRules = new Set(this.controller.handleRules.filterBy('enabled').mapBy('id'));
    const enabledEntities = new Set(this.controller.entityTypes.filterBy('enabled').mapBy('name'));
    const vintage = this.controller.includeVintage;
    return this.allConflicts.filter((c) => {
      if (!enabledRules.has(c.ruleId)) {
        return false; // rule is disabled
      }
      if (c.conflictingHandle) {
        if (vintage && c.conflictingHandle.personVintage) {
          return true; // requested to show all vintage
        }
        if (!enabledEntities.has(c.conflictingHandle.entityType)) {
          return false; // entity type is disabled
        }
      }
      return true; // default case
    });
  }
}

class Rule {
  @tracked enabled;

  constructor(obj) {
    Object.assign(this, obj);
  }
}

class EntityType {
  @tracked enabled;

  constructor(obj) {
    Object.assign(this, obj);
  }
}

export default class VcHandlerCheckerController extends ClubhouseController {
  @tracked currentName = '';
  @tracked includeVintage = true; // Check vintage even if status isn't checked
  @tracked checkedHandles = []; // Array of {id string, name string, conflicts HandleConflict[]}
  @tracked allHandles = []; // Same Handle objects as model

  /** Maps rule ID to {name string, rule object, enabled boolean} */
  buildHandleRules() {
    const handles = this.allHandles.toArray();
    const rules = [];
    const addRule = (rule, name, enabled = true) => rules.push(new Rule({
      id: rule.id,
      name: name,
      rule: rule,
      enabled: enabled,
    }));
    // Rule ordering: Substring is first per 2019 request from Threepio.
    // No input yet on ideal ordering for all checks.
    addRule(new SubstringRule(handles), 'Substring');
    addRule(new MinLengthRule(), 'Minimum Length');
    addRule(new PhoneticAlphabetRule(handles), 'Phonetic alphabet');
    addRule(new EditDistanceRule(handles), 'Edit distance');
    addRule(new AmericanSoundexRule(handles), 'American Soundex');
    addRule(new DoubleMetaphoneRule(handles), 'Double Metaphone');
    addRule(new EyeRhymeRule(handles), 'Eye rhymes');
    addRule(new ExperimentalEyeRhymeRule(handles), 'Experimental eye rhymes', false);

    this.handleRules = rules;

    this.ruleNames = this.handleRules.reduce((names, rule) => {
      names[rule.id] = rule.name;
      return names;
    }, {});
  }

  buildEntityTypes() {
    const comparator = (entity1, entity2) => {
      // group all "$status ranger" statuses together
      const isRanger1 = !ReservationTypeLabels[entity1];
      const isRanger2 = !ReservationTypeLabels[entity2];
      if (isRanger1 !== isRanger2) {
        return isRanger2 - isRanger1;
      }
      return entity1.localeCompare(entity2);
    }
    // By default, alphas can choose the handle of a non-vintage retired Ranger
    const disabledByDefault = new Set(['retired', 'non ranger']);
    this.entityTypes = this.allHandles.mapBy('entityType').uniq().sort(comparator).map((type) => new EntityType({
      id: dasherize(type),
      name: type,
      label: ReservationTypeLabels[type] ?? type,
      enabled: !disabledByDefault.has(type),
    }));
  }

  @cached
  get allEnabledHandles() {
    const enabled = new Set(this.entityTypes.filterBy('enabled').mapBy('name'));
    const vintage = this.includeVintage;
    return this.allHandles
      .filter((handle) => (vintage && handle.personVintage) || enabled.has(handle.entityType));
  }

  /** Checks the currently-entered name against each rule and updates checkedHandles with the results. */
  @action
  checkCurrentName() {
    const name = this.currentName.trim();
    if (name === '') {
      return;
    }
    const conflicts = [];
    const rules = Object.values(this.handleRules).map((obj) => obj.rule);
    const id = nextCheckId++;
    rules.forEach((rule) => {
      rule.check(name).forEach((conflict) => conflicts.push(conflict));
    });
    conflicts.sort(HandleConflict.comparator);
    this.checkedHandles.unshiftObject(new CheckedHandle({
      controller: this,
      id: id,
      name: name,
      allConflicts: conflicts,
    }));
    this.currentName = '';
  }

  /** Resets the list of checked handles. */
  @action
  clearCheckedHandles() {
    this.checkedHandles = [];
  }

  @action
  focusElement(element) {
    element.focus();
  }

  @action
  entityTypeLabel(type) {
    return ReservationTypeLabels[type] ?? type;
  }
}
