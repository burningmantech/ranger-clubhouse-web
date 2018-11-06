import { helper } from '@ember/component/helper';
import ENV from 'clubhouse/config/environment';

// Method to bounce back over to clubhouse classic website

export function cgo([ controller, method], params) {
  if (!ENV.dualClubhouse) {
    return '#';
  }

  let url = ENV.clubhouseClassicUrl+`/?DMSc=${controller}&DMSm=${method}`;

  if (params) {
    Object.keys(params).forEach((key) => {
      url += `&${key}=${params[key]}`;
    });
  }

  return url;
}

export default helper(cgo);
