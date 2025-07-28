/* bench-tyres.cjs  •  sequential autocannon runs  */
const autocannon = require('autocannon');

const TARGET      = process.env.TARGET ?? 'http://localhost:3000';
const REQ_TOTAL   = Number(process.argv[2]) || 1_000;
const CONNECTIONS = Number(process.argv[3]) || 32;
const ONLY        = process.argv[4] ?? null;

const scenarios = [
  { name: 'baseline',        path: '/tyres' },
  { name: 'size',            path: '/tyres?size=205-55-r16' },
  { name: 'size+season',     path: '/tyres?size=205-55-r16&season=mixt' },
  { name: 'brand-only',      path: '/tyres?brand=pirelli' },
  { name: 'brand+model',     path: '/tyres?brand=pirelli&model=pirelli-winter-sotto-zero-3' },
  { name: 'q-search',        path: '/tyres?q=winter' },
  { name: 'size+sort-price', path: '/tyres?size=205-55-r16&sort=price' },
  { name: 'page-10',         path: '/tyres?size=205-55-r16&page=10&limit=24' },
  { name: 'tag-landing',     path: '/tags/ford-focus/tyres', abs: true },
].filter(s => !ONLY || s.name === ONLY);

async function runOne(s) {
  process.stdout.write(`\n▶ ${s.name}  (${REQ_TOTAL} req • ${CONNECTIONS} conns)\n`);
  const res = await autocannon({
    url         : s.abs ? `${TARGET}${s.path}` : `${TARGET}${s.path}`,
    method      : 'GET',
    connections : CONNECTIONS,
    pipelining  : 1,
    amount      : REQ_TOTAL,
    timeout     : 30,
  });
  const { latency , requests } = res;
  console.log(
    `  p50: ${latency.p50} ms  •  p95: ${latency.p95} ms  •  max: ${latency.max} ms`,
    `\n  RPS : ${requests.average.toFixed(0)}\n`,
  );
}

(async () => {
  for (const s of scenarios) await runOne(s);
})();
