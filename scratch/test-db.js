const postgres = require('../server/node_modules/postgres');
const sql = postgres('postgresql://postgres.msziifhbqyukwvawzacs:DBBQAtr3MMkbIOb6@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres', {
  ssl: 'require'
});

async function main() {
  try {
    const result = await sql`SELECT NOW()`;
    console.log('Success:', result);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await sql.end();
  }
}
main();
