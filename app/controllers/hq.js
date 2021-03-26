import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';

export default class HqController extends ClubhouseController {
  get allowedCheckIn() {
    const status = this.person.status;

    switch (status) {
      case 'active':
      case 'alpha':
      case 'inactive extension': // might be cheetah
      case 'inactive': // might be cheetah
      case 'non ranger':
      case 'prospective':
      case 'retired': // might be cheetah
        return true;
    }
    return false;
  }

  get mealInfo() {
    switch (this.eventInfo.meals) {
      case 'all':
        return 'NO POG - has Eat It All BMID';
      case 'pre':
        return "NO POG PRE-EVENT";
      case 'post':
        return 'NO POG POST-EVENT';
      case 'event':
        return 'NO POG PRE OR POST-EVENT';
      case 'pre+event':
        return 'NO POG PRE & EVENT WEEK';
      case 'event+post':
        return 'NO POG EVENT & POST EVENT';
      case 'pre+post':
        return 'NO POG DURING EVENT';

      case 'pogs':
        return 'Every shift worked';
      default:
        if (!this.eventInfo.meals) {
          return 'Every shift worked';
        }
        return `Unknown ${this.eventInfo.meals}`;
    }
  }

}
