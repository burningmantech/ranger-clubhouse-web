export class HandleConflict {
  constructor(candidateName, description, priority, ruleId, conflict) {
    this.candidateName = candidateName;
    this.description = description;
    this.priority = priority;
    this.ruleId = ruleId;
    this.conflict = conflict;
  }
}
