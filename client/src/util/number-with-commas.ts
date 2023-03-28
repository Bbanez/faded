export default function numberWithCommas(x?: number, toFixed = 0) {
  if (!x) return 0;
  const number = x.toFixed(toFixed);
  const parts = number.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}
