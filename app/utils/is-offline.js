export default function isOffline(response) {
  return response.name === 'NetworkError'
    || response.message?.match(/NetworkError/)
    || response.message?.match(/Network request failed/i)
    || response.message?.match(/Failed to fetch/i);
}
