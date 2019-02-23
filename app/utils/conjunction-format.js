export default function conjunctionFormat(a, conjunction) {
  return [a.slice(0, -1).join(', '), a.pop()].filter(w => w !== '').join(` ${conjunction} `);
}
