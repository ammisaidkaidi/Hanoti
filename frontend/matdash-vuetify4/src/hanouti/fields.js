/**
 * Map database columns onto the template's form/table field descriptors.
 *
 * `CrudField` (from src/com/CrudTable/types.ts) drives both the form inputs and
 * the table columns, so a single mapping per column gives list columns, filters
 * and the create/edit dialog consistent behaviour.
 */
import { columnLabel } from './labels.js';

const moneyPattern = /(price|amount|total|subtotal|balance|cost|tax|discount|paid)/;
const quantityPattern = /(quantity|qty|stock|count|level|minimum|reorder)/;
const datePattern = /(_at$|_date$|^date_)/;
const booleanTypes = new Set(['boolean']);
const numericTypes = new Set(['integer', 'bigint', 'numeric']);

/**
 * Columns never shown in a create/edit form: server-managed values.
 */
export function isFormEditable(column) {
  if (column.primary) return false;
  if (column.audit) return false;
  if (column.name === 'embedded' || column.type === 'vector') return false;
  return true;
}

/** Columns worth showing as list columns, capped so tables stay readable. */
export function listColumnsFor(entity, limit = 7) {
  const preferred = [
    'code',
    'sku',
    'document_number',
    'number',
    'name',
    'full_name',
    'display_name',
    'legal_name',
    'setting_key',
    'key',
    'email',
    'party_type',
    'kind',
    'status',
    'effect',
    'entity_type',
    'action',
    'quantity',
    'sale_price',
    'price',
    'amount',
    'total',
    'amount_total',
    'balance',
    'unit_code',
    'is_active',
    'enabled',
    'valid_from',
    'order_date',
    'due_date',
    'issued_at',
    'occurred_at',
    'created_at',
  ];
  const byName = new Map(entity.columns.map((column) => [column.name, column]));
  const chosen = [];
  const push = (column) => {
    if (column && !chosen.some((existing) => existing.name === column.name)) chosen.push(column);
  };

  for (const name of preferred) {
    if (chosen.length >= limit) break;
    push(byName.get(name));
  }
  for (const column of entity.columns) {
    if (chosen.length >= limit) break;
    if (!column.audit && column.name !== 'description' && column.name !== 'notes') push(column);
  }
  return chosen.map((column) => column.name);
}

/**
 * Build the CrudField descriptor for one column.
 * `references` optionally maps a `*_id` column to the entity that owns it, so
 * the generated form renders a select of related records instead of raw UUIDs.
 */
export function fieldFor(column, options = {}) {
  const label = columnLabel(column.name);
  const reference = options.references?.[column.name];
  const field = {
    key: column.property ?? column.name,
    label,
    column: column.name,
    type: 'text',
    required: !column.nullable && column.default === null && !column.primary,
    wide: column.name === 'description' || column.name === 'notes' || column.name === 'metadata',
    help: column.help,
  };

  if (reference) {
    field.type = 'select';
    field.items = options.choices?.[reference] ?? [];
    field.reference = reference;
    field.help = field.help ?? `Référence ${reference}`;
    return field;
  }

  if (booleanTypes.has(column.type)) {
    field.type = 'switch';
    field.default = column.default === 'true';
    return field;
  }
  if (numericTypes.has(column.type)) {
    field.type = 'number';
    field.min = 0;
    if (column.type === 'numeric') field.step = 0.01;
    return field;
  }
  if (datePattern.test(column.name) || column.type === 'date' || column.type === 'timestamptz') {
    field.type = column.type === 'date' ? 'date' : 'text';
    field.kind = 'date';
    field.help = field.help ?? 'Format attendu : AAAA-MM-JJ ou date ISO complète';
    return field;
  }
  if (column.array) {
    field.type = 'text';
    field.kind = 'array';
    field.help = field.help ?? 'Séparer les valeurs par des virgules';
    return field;
  }
  if (column.type === 'jsonb') {
    field.type = 'textarea';
    field.kind = 'json';
    field.wide = true;
    field.help = field.help ?? 'Objet JSON valide';
    return field;
  }
  if (column.length !== null && column.length <= 32) field.maxLength = column.length;
  return field;
}

/** All form fields for an entity, excluding server-managed columns. */
export function formFieldsFor(entity, options = {}) {
  return entity.columns
    .filter(isFormEditable)
    .map((column) => fieldFor(column, options));
}

/** Table-only descriptors for the list columns. */
export function columnsFor(entity, names) {
  return names
    .map((name) => entity.columns.find((column) => column.name === name))
    .filter(Boolean)
    .map((column) => ({ name: column.name, label: columnLabel(column.name), type: column.type }));
}

const dateFormatter = new Intl.DateTimeFormat('fr-DZ', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

const numberFormatter = new Intl.NumberFormat('fr-DZ', { maximumFractionDigits: 2 });

/** Render one value for display, using the column type. */
export function formatValue(value, column) {
  if (value === null || value === undefined || value === '') return '—';
  if (Array.isArray(value)) return value.length === 0 ? '—' : value.join(', ');
  if (column.type === 'boolean') return value ? 'Oui' : 'Non';
  if (column.type === 'timestamptz' || column.type === 'date') {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return column.type === 'date'
      ? new Intl.DateTimeFormat('fr-DZ').format(date)
      : dateFormatter.format(date);
  }
  if (column.type === 'jsonb' && typeof value === 'object') return JSON.stringify(value);
  if (numericTypes.has(column.type)) {
    const number = Number(value);
    if (Number.isNaN(number)) return String(value);
    if (moneyPattern.test(column.name)) return `${numberFormatter.format(number)} DA`;
    if (quantityPattern.test(column.name)) return numberFormatter.format(number);
    return numberFormatter.format(number);
  }
  return String(value);
}

/** Format a numeric value as Algerian dinar, for KPI tiles. */
export function money(value) {
  return `${numberFormatter.format(Number(value) || 0)} DA`;
}

export { numberFormatter, dateFormatter };
