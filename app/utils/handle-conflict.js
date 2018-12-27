/** Data object encapsulating a potential problem identified by a handle rule. */
export class HandleConflict {
  static comparator(a, b) {
    if (a.priority != b.priority){
      return HandleConflict.numericPriority(a.priority) - HandleConflict.numericPriority(b.priority);
    }
    if (a.ruleId != b.ruleId) {
      return a.ruleId.localeCompare(b.ruleId);
    }
    if (a.conflictingHandle && b.conflictingHandle) {
      return a.conflictingHandle.name.localeCompare(b.conflictingHandle.name);
    }
    return a.description.localeCompare(b.description);
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

