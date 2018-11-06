import ENV from 'clubhouse/config/environment';

export function config(variable) {
  const clientConfig = ENV['clientConfig'];

  if (!clientConfig) {
    return null;
  }

  return clientConfig[variable];
}
