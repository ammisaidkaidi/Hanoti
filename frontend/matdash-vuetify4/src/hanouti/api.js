/**
 * Data access for the hanouti screens.
 *
 * The backend does not exist yet, so two adapters sit behind one interface:
 *
 *   mock — deterministic sample rows generated from the database definition, so
 *          every screen and form is usable and reviewable today;
 *   http — plain `fetch` against the API that will be built later.
 *
 * Set VITE_HANOUTI_API (for example "/api" or "http://localhost:8000/api") to
 * switch to the HTTP adapter. Every call site is already written against the
 * final shape, so nothing in the views changes when the backend lands.
 */
import { entities } from './generated/schema.js';
import { tableLabel } from './labels.js';

const apiBase = import.meta.env?.VITE_HANOUTI_API ?? '';

export const dataSource = apiBase === '' ? 'mock' : 'http';

/* -------------------------------------------------------------------------- */
/* Deterministic mock dataset                                                 */
/* -------------------------------------------------------------------------- */

/**
 * A small generator with a fixed seed: sample rows are stable between reloads,
 * so screenshots, reviews and tests do not shuffle. Values are derived from the
 * column metadata itself — types, lengths, references — which keeps the mock
 * data honest about the schema without inventing business rules.
 */
function makeRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

const words = {
  erp: ['Bureau', 'Atelier', 'Dépôt central', 'Quincaillerie', 'Alimentation', 'Textile', 'Peinture', 'Électricité', 'Menuiserie', 'Plomberie'],
  auth: ['Administrateur', 'Vendeur', 'Caissier', 'Magasinier', 'Comptable', 'Auditeur', 'Responsable achats', 'Superviseur'],
  app: ['Préférence', 'Notification', 'Fichier', 'Indicateur', 'Audit'],
  settings: ['Devise', 'TVA', 'Numérotation', 'Stock minimum', 'Arrondi', 'Impression'],
};

function seedValue(entity, column, index, random) {
  const vocab = words[entity.schema] ?? words.app;
  const uuid = `00000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`;

  if (column.primary) return uuid;
  if (column.name.endsWith('_id')) {
    // Keep foreign keys inside the same deterministic space so joins line up.
    const offset = 1 + Math.floor(random() * 4);
    return `00000000-0000-4000-8000-${String(offset).padStart(12, '0')}`;
  }
  if (column.type === 'boolean') return random() > 0.35;
  if (column.type === 'uuid') return uuid;
  if (column.type === 'integer' || column.type === 'bigint') {
    return Math.floor(random() * 200) + 1;
  }
  if (column.type === 'numeric') {
    if (/price|amount|total|balance/.test(column.name)) return Math.round(random() * 40000) / 2;
    return Math.round(random() * 1000) / 10;
  }
  if (column.type === 'timestamptz' || column.type === 'date') {
    const days = Math.floor(random() * 120);
    const date = new Date(Date.UTC(2026, 0, 1) + days * 86400000);
    return column.type === 'date' ? date.toISOString().slice(0, 10) : date.toISOString();
  }
  if (column.type === 'jsonb') return column.name === 'metadata' || column.name === 'payload' ? {} : {};
  if (column.array) return [vocab[index % vocab.length]];
  if (column.type === 'vector') return null;
  if (column.type === 'inet') return `192.168.1.${(index % 250) + 2}`;

  const base = vocab[index % vocab.length];
  switch (column.name) {
    case 'email':
      return `utilisateur${index + 1}@hanouti.dz`;
    case 'phone':
      return `05${String(50000000 + index * 137).slice(0, 8)}`;
    case 'code':
    case 'sku':
      return `${entity.table.slice(0, 3).toUpperCase()}-${String(index + 1).padStart(4, '0')}`;
    case 'status':
      return ['active', 'pending', 'suspended'][index % 3];
    case 'effect':
      return index % 2 === 0 ? 'allow' : 'deny';
    case 'record_scope':
    case 'scope_type':
      return ['global', 'own_party', 'self'][index % 3];
    case 'risk_level':
      return ['normal', 'sensitive', 'critical'][index % 3];
    case 'party_type':
      return index % 2 === 0 ? 'customer' : 'supplier';
    case 'kind':
      return ['stock', 'service'][index % 2];
    case 'unit_code':
      return ['each', 'kg', 'litre', 'box'][index % 4];
    case 'currency_code':
      return 'DZD';
    case 'nif':
      return `00${String(100000000 + index * 7919).slice(0, 9)}`;
    case 'setting_key':
    case 'key':
      return `${entity.table.split('_')[0]}.${['currency', 'vat', 'numbering', 'rounding'][index % 4]}`;
    case 'value_type':
      return ['string', 'number', 'boolean', 'json'][index % 4];
    case 'document_kinds':
      return ['sale', 'purchase'];
    case 'scope_precedence':
      return ['user', 'role', 'global'];
    case 'action':
      return ['create', 'update', 'delete', 'login'][index % 4];
    case 'entity_type':
      return ['erp.products', 'erp.sales_orders', 'auth.users'][index % 3];
    case 'source_schema':
      return ['erp', 'auth', 'app'][index % 3];
    case 'token_hash':
      return `sha256:${String(index).padStart(6, '0')}${'a'.repeat(40)}`;
    case 'name':
    case 'full_name':
    case 'display_name':
      return `${base} ${index + 1}`;
    default:
      break;
  }
  if (column.length !== null) return base.slice(0, column.length);
  return base;
}

const mockStore = new Map();

/** Rows for one entity, generated on first use. */
export function mockRows(key) {
  const entity = entities.find((candidate) => candidate.key === key);
  if (!entity) return [];
  if (mockStore.has(key)) return mockStore.get(key).slice();

  // Child tables get more rows than their parents, mirroring real proportions.
  const count = /_items$/.test(entity.table) ? 12 : /movements|audit/.test(entity.table) ? 14 : 6;
  const random = makeRandom(
    key.split('').reduce((hash, character) => (hash * 31 + character.charCodeAt(0)) >>> 0, 7),
  );

  const rows = Array.from({ length: count }, (_, index) => {
    const row = {};
    for (const column of entity.columns) {
      row[column.property ?? column.name] = seedValue(entity, column, index, random);
    }
    return row;
  });

  mockStore.set(key, rows);
  return rows.slice();
}

function commitMock(key, rows) {
  mockStore.set(key, rows.slice());
}

/* -------------------------------------------------------------------------- */
/* Adapters                                                                   */
/* -------------------------------------------------------------------------- */

const mockAdapter = {
  async list(key) {
    return mockRows(key);
  },
  async create(key, record) {
    const rows = mockRows(key);
    const entity = entities.find((candidate) => candidate.key === key);
    const idProperty = entity.columns.find((column) => column.primary)?.property ?? 'id';
    const next = { ...record, [idProperty]: crypto.randomUUID?.() ?? `local-${Date.now()}` };
    commitMock(key, [next, ...rows]);
    return next;
  },
  async update(key, record) {
    const entity = entities.find((candidate) => candidate.key === key);
    const idProperty = entity.columns.find((column) => column.primary)?.property ?? 'id';
    const rows = mockRows(key).map((row) => (row[idProperty] === record[idProperty] ? { ...row, ...record } : row));
    commitMock(key, rows);
    return record;
  },
  async remove(key, id) {
    const entity = entities.find((candidate) => candidate.key === key);
    const idProperty = entity.columns.find((column) => column.primary)?.property ?? 'id';
    commitMock(key, mockRows(key).filter((row) => row[idProperty] !== id));
  },
};

const httpAdapter = {
  async list(key) {
    return request(`/${key.replace('.', '/')}`);
  },
  async create(key, record) {
    return request(`/${key.replace('.', '/')}`, { method: 'POST', body: record });
  },
  async update(key, record) {
    const entity = entities.find((candidate) => candidate.key === key);
    const idProperty = entity.columns.find((column) => column.primary)?.property ?? 'id';
    return request(`/${key.replace('.', '/')}/${record[idProperty]}`, { method: 'PUT', body: record });
  },
  async remove(key, id) {
    return request(`/${key.replace('.', '/')}/${id}`, { method: 'DELETE' });
  },
};

async function request(path, options = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    method: options.method ?? 'GET',
    headers: { 'content-type': 'application/json' },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`${response.status} ${response.statusText}${detail ? ` — ${detail}` : ''}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

const adapter = dataSource === "mock" ? mockAdapter : httpAdapter;

/* -------------------------------------------------------------------------- */
/* Public API                                                                 */
/* -------------------------------------------------------------------------- */

export const repo = {
  source: dataSource,
  list: (key) => adapter.list(key),
  create: (key, record) => adapter.create(key, record),
  update: (key, record) => adapter.update(key, record),
  remove: (key, id) => adapter.remove(key, id),
};

/** KPI summary for the dashboard, derived from whatever the adapter returns. */
export async function dashboardSnapshot() {
  const [orders, purchases, products, customers, payments, movements] = await Promise.all([
    repo.list('erp.sales_orders'),
    repo.list('erp.purchase_orders'),
    repo.list('erp.products'),
    repo.list('erp.customers'),
    repo.list('erp.payments'),
    repo.list('erp.stock_movements'),
  ]);

  const sum = (rows, property) =>
    rows.reduce((total, row) => total + (Number(row[property]) || 0), 0);

  const lowStock = products.filter((product) => {
    const stock = Number(product.stock ?? product.quantity ?? 0);
    const minimum = Number(product.min_stock ?? product.reorder_level ?? 0);
    return minimum > 0 && stock <= minimum;
  });

  return {
    salesOrders: orders.length,
    salesTotal: sum(orders, 'total') || sum(orders, 'amount_total') || sum(orders, 'subtotal'),
    purchaseOrders: purchases.length,
    purchaseTotal: sum(purchases, 'total') || sum(purchases, 'amount_total'),
    products: products.length,
    customers: customers.length,
    payments: payments.length,
    paymentsTotal: sum(payments, 'amount'),
    movements: movements.length,
    lowStock,
    recentOrders: orders.slice(0, 5),
    recentMovements: movements.slice(0, 5),
  };
}

/** Label helper for a table key, used by screens and messages. */
export function entityLabel(key) {
  return tableLabel(key);
}

export { entities };
