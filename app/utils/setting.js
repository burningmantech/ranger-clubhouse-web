import ENV from 'clubhouse/config/environment';

export function setting(variable) {
  const clientConfig = ENV['clientConfig'];

  if (!clientConfig) {
    return null;
  }

  return clientConfig[variable];
}
