import Component from '@glimmer/component';
import {ColumnLabels, StatusLabels} from "clubhouse/models/prospective-application";
import {action} from '@ember/object';
import _ from 'lodash';
import {htmlSafe} from '@ember/template';

export default class VcApplicationAuditLogComponent extends Component {

  columnLabel(column) {
    return ColumnLabels[column] ?? column;
  }

  @action
  changeValues(changes, column, meta) {
    if (column === 'assigned_person_id' && meta?.assigned_person) {
      return this._buildValues(meta.assigned_person);
    } else if (column === 'status') {
      return this._buildValues([StatusLabels[changes[0]] ?? changes[0], StatusLabels[changes[1]] ?? changes[1]]);
    }

    return this._buildValues(changes);
  }

  _buildValues(changes) {
    if (_.isArray(changes)) {
      return htmlSafe(`${this._nullOrValue(changes[0])} &rarr; ${this._nullOrValue(changes[1])}`);
    } else {
      return changes;
    }
  }

  _nullOrValue(value) {
    if (value === null || value === '') {
      return '<i>blank</i>';
    } else {
      return _.escape(value);
    }
  }
}
