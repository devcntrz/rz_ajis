/**
 * scripts/lib/sequences.mjs — shared identity-sequence logic.
 *
 * One implementation, two callers: scripts/seed.mjs (after loading fixtures) and
 * scripts/fix-sequences.mjs (after a restore or bulk load).
 *
 * Why this exists at all: an identity/serial sequence only advances when Postgres
 * itself hands out the value. Any path that supplies its own ids — a data-only
 * pg_restore, a COPY-based ETL, the seed's OVERRIDING SYSTEM VALUE inserts —
 * leaves the sequence behind, and the next ordinary INSERT then collides with an
 * existing row. Resyncing is the fix, and it has to be driven from the catalog so
 * it cannot go stale when tables are added.
 */

/**
 * Every identity column in the schema, read from the catalog — never a hand-kept list.
 * Also covers legacy serial/bigserial columns, so it stays correct if one reappears.
 */
export async function identityColumns(client, schema = 'public') {
  const { rows } = await client.query(
    `SELECT c.table_name  AS table,
            c.column_name AS column,
            pg_get_serial_sequence(format('%I.%I', c.table_schema, c.table_name),
                                   c.column_name) AS sequence
       FROM information_schema.columns c
       JOIN information_schema.tables t
         ON t.table_schema = c.table_schema AND t.table_name = c.table_name
      WHERE c.table_schema = $1
        AND t.table_type   = 'BASE TABLE'
        AND (c.is_identity = 'YES' OR c.column_default LIKE 'nextval%')
      ORDER BY c.table_name, c.column_name`,
    [schema],
  );
  return rows.filter((r) => r.sequence);
}

/**
 * Current sequence position vs the largest id actually stored, per column.
 * `drifted` means the next generated id would collide with an existing row.
 */
export async function inspectSequences(client, schema = 'public') {
  const cols = await identityColumns(client, schema);
  const out = [];
  for (const { table, column, sequence } of cols) {
    const { rows } = await client.query(
      `SELECT COALESCE((SELECT max("${column}") FROM "${table}"), 0)::bigint AS max_id,
              (SELECT last_value FROM ${sequence})::bigint                   AS last_value,
              (SELECT is_called FROM ${sequence})                            AS is_called`,
    );
    const maxId = Number(rows[0].max_id);
    const lastValue = Number(rows[0].last_value);
    const isCalled = rows[0].is_called;
    // The next value handed out. If is_called is false the sequence returns
    // last_value itself rather than last_value + 1.
    const nextValue = isCalled ? lastValue + 1 : lastValue;
    out.push({ table, column, sequence, maxId, lastValue, nextValue, drifted: nextValue <= maxId });
  }
  return out;
}

/**
 * Point every sequence just past the largest stored id. Safe to run repeatedly,
 * and safe on empty tables (falls back to 1).
 */
export async function resyncSequences(client, schema = 'public') {
  const cols = await identityColumns(client, schema);
  const changed = [];
  for (const { table, column, sequence } of cols) {
    const { rows } = await client.query(
      `SELECT setval('${sequence}',
                     GREATEST(COALESCE((SELECT max("${column}") FROM "${table}"), 0), 1),
                     true)::bigint AS value`,
    );
    changed.push({ table, column, value: Number(rows[0].value) });
  }
  return changed;
}
