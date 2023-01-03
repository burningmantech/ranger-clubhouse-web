import Component from '@glimmer/component';

export default class ShiftLeadTableComponent extends Component {
   positionCss(person) {
     if (person.is_greendot) {
       return 'bg-shift-lead-greendot';
     }

     if (person.is_troubleshooter && !(person.is_rsl || person.is_ood)) {
       return "bg-shift-lead-troubleshooter";
     }
  }

  rowCss(idx) {
    return (idx % 2) !== 0 ? 'tr-stripped' : '';
  }
}
