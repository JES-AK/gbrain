// apply-supabase.ts
// Bypass for gbrain init's Supabase bug (getaddrinfo ENOTFOUND).
// Uses gbrain's own PostgresEngine + initSchema directly.
//
// Usage:
//   export GBRAIN_DATABASE_URL="postgresql://postgres.<ref>:<pw>@aws-1-ap-south-1.pooler.supabase.com:5432/postgres"
//   bun apply-supabase.ts

import { PostgresEngine } from './src/core/postgres-engine.ts';
import { saveConfig } from './src/core/config.ts';

const url = process.env.GBRAIN_DATABASE_URL;
if (!url) {
  console.error('GBRAIN_DATABASE_URL not set');
  process.exit(1);
}

console.log('Constructing PostgresEngine...');
const engine = new PostgresEngine();

console.log('Connecting to Supabase...');
await engine.connect({ database_url: url, engine: 'postgres' });

console.log('Running schema + migrations (this is what gbrain init failed at)...');
await engine.initSchema();
console.log('Schema applied.');

const stats = await engine.getStats();
console.log(`Pages in brain: ${stats.page_count}`);

await engine.disconnect();
console.log('Disconnected from Supabase.');

console.log('Saving ~/.gbrain/config.json pointing at Supabase...');
saveConfig({
  engine: 'postgres',
  database_url: url,
  database_path: undefined,
  embedding_disabled: true,
});

console.log('\nDone.\n');
console.log('Verify with:');
console.log('  gbrain doctor --json');
console.log('  echo "first page on Supabase brain" | gbrain put hello-supabase');
console.log('  gbrain search "first page"');
