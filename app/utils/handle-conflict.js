/** Data object encapsulating a potential problem identified by a handle rule. */
export class HandleConflict {
  static comparator(a, b) {
    if (a.priority != b.priority){
      return HandleConflict.numericPriority(a.priority) - HandleConflict.numericPriority(b.priority);
    }
    let ruleResult = HandleConflict.ruleIdCompare(a.ruleId, b.ruleId);
    if (ruleResult !== 0) {
      return ruleResult;
    }
    if (a.conflictingHandle && b.conflictingHandle) {
      return a.conflictingHandle.name.localeCompare(b.conflictingHandle.name);
    }
    return a.description.localeCompare(b.description);
  }

  static ruleIdCompare(ruleId1, ruleId2) {
    if (ruleId1 === ruleId2) {
      return 0;
    }
    // Rule ordering: Substring is first per 2019 request from Threepio.
    if (ruleId1 === 'substring') {
      return -1;
    }
    if (ruleId2 === 'substring') {
      return 1;
    }
    // No input yet on ordering of other rules, so sort by name.
    // If a full ordering is specified, use a map of ID to priority
    // instead of these if checks.
    return ruleId1.localeCompare(ruleId2);
  }

  static numericPriority(priority) {
    switch (priority) {
      case 'high': return 1;
      case 'medium': return 2;
      case 'low': return 3;
      default: throw new Error(`Unknown priority '${priority}'`);
    }
  }

  constructor(candidateName, description, priority, ruleId, conflictingHandle) {
    this.candidateName = candidateName;
    this.description = description;
    this.priority = priority;
    this.ruleId = ruleId;
    this.conflictingHandle = conflictingHandle;
  }
}

