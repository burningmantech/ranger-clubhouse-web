// Take an option list and convert it to labels.

export default function optionsToLabels(opts) {
  return opts.reduce((hash, opt) => {
    hash[opt[1]] = opt[0];
    return hash;
  }, {});
}
