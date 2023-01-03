import {SHIRT_T_SHIRT, SHIRT_LONG_SLEEVE, TYPE_DEPT_SHIRT} from 'clubhouse/models/swag';

function buildOptions(shirts, type, includeNone) {
  const opts = shirts.filter((s) => s.active && s.type === TYPE_DEPT_SHIRT && s.shirt_type === type).map((s) => ([
    s.title, s.id
  ]));
  if (includeNone) {
    opts.unshift(['Not Selected', '']);
  }
  return opts;
}

export default function shirtOptions(shirts, includeNone = true) {
  return {
    tshirtOptions: buildOptions(shirts, SHIRT_T_SHIRT, includeNone),
    longSleeveOptions: buildOptions(shirts, SHIRT_LONG_SLEEVE, includeNone),
    shirtsById: shirts.reduce((hash, s) => {
      hash[s.id] = s;
      return hash;
    }, {})
  }
}
