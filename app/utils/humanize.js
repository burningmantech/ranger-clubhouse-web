// Copied from the defunct ember-cli-string-helpers

export default function humanize(string) {
  if (!string) {
    return '';
  }

  const result = string.toLowerCase().replace(/_+|-+/g, ' ');
  return result.charAt(0).toUpperCase() + result.slice(1);
}
