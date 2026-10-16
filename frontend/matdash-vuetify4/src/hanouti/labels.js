/**
 * French labels for the hanouti domain.
 *
 * Kept out of the generated schema on purpose: the structure comes from the SQL
 * declarations, the wording comes from here, and the two evolve independently.
 * The project's navigation (builtin/assets/AppSitemap.V2.json) is French, so the
 * entity screens are too.
 */

/** Table labels, used in navigation, page titles and breadcrumbs. */
export const tableLabels = {
  // erp
  'erp.products': 'Articles',
  'erp.categories': 'Catégories',
  'erp.brands': 'Marques',
  'erp.customers': 'Clients',
  'erp.suppliers': 'Fournisseurs',
  'erp.warehouses': 'Dépôts',
  'erp.sales_orders': 'Commandes clients',
  'erp.sales_order_items': 'Lignes de commande client',
  'erp.purchase_orders': 'Commandes fournisseurs',
  'erp.purchase_order_items': 'Lignes de commande fournisseur',
  'erp.payments': 'Paiements',
  'erp.stock_movements': 'Mouvements de stock',
  // auth
  'auth.users': 'Utilisateurs',
  'auth.roles': 'Rôles',
  'auth.permissions': 'Permissions',
  'auth.user_roles': 'Rôles attribués',
  'auth.role_permissions': 'Permissions des rôles',
  'auth.sessions': 'Sessions',
  'auth.password_reset_tokens': 'Jetons de réinitialisation',
  'auth.email_verification_tokens': 'Jetons de vérification',
  'auth.party_memberships': 'Rattachements clients/fournisseurs',
  'auth.subject_permissions': 'Permissions directes',
  // app
  'app.user_preferences': 'Préférences utilisateur',
  'app.files': 'Fichiers',
  'app.notifications': 'Notifications',
  'app.feature_flags': 'Indicateurs de fonctionnalité',
  'app.audit_events': "Journal d'audit",
  // settings
  'settings.setting_definitions': 'Définitions de paramètres',
  'settings.gsettings': 'Paramètres globaux',
  'settings.settings': 'Paramètres par portée',
};

/** Schema labels, in the order they are presented. */
export const schemaLabels = {
  erp: 'Gestion (ERP)',
  auth: 'Identités et accès',
  app: 'Application',
  settings: 'Paramètres',
};

export const schemaDescriptions = {
  erp: 'Articles, tiers, achats, ventes, stock et paiements.',
  auth: 'Utilisateurs, rôles, permissions, sessions et rattachements.',
  app: "Préférences, fichiers, notifications, indicateurs et journal d'audit.",
  settings: 'Définitions, valeurs globales et valeurs par portée.',
};

/** Column labels. Anything absent falls back to a humanised column name. */
export const columnLabels = {
  id: 'Identifiant',
  code: 'Code',
  name: 'Nom',
  full_name: 'Nom complet',
  display_name: 'Nom affiché',
  legal_name: 'Raison sociale',
  first_name: 'Prénom',
  last_name: 'Nom',
  email: 'E-mail',
  phone: 'Téléphone',
  status: 'Statut',
  description: 'Description',
  notes: 'Notes',
  address: 'Adresse',
  city: 'Ville',
  wilaya: 'Wilaya',
  country: 'Pays',
  nif: 'NIF',
  nis: 'NIS',
  rc: 'Registre de commerce',
  ai: 'Article d\'imposition',
  sku: 'Référence (SKU)',
  barcode: 'Code-barres',
  unit_code: 'Unité',
  currency_code: 'Devise',
  kind: 'Nature',
  party_type: 'Type de tiers',
  legal_form: 'Forme juridique',
  activity_code: 'Code activité',
  is_active: 'Actif',
  is_enabled: 'Activé',
  is_delegable: 'Délégable',
  is_overridable: 'Modifiable',
  frozen: 'Figé',
  created_at: 'Créé le',
  updated_at: 'Modifié le',
  occurred_at: 'Survenu le',
  recorded_at: 'Enregistré le',
  valid_from: 'Valide du',
  valid_until: 'Valide au',
  revoked_at: 'Révoqué le',
  expires_at: 'Expire le',
  last_seen_at: 'Dernière activité',
  last_login_at: 'Dernière connexion',
  email_verified_at: 'E-mail vérifié le',
  verified_at: 'Vérifié le',
  used_at: 'Utilisé le',
  read_at: 'Lu le',
  archived_at: 'Archivé le',
  effect: 'Effet',
  record_scope: 'Portée',
  scope_type: 'Type de portée',
  scope_id: 'Identifiant de portée',
  scope_precedence: 'Ordre de priorité',
  permission_code: 'Permission',
  resource_type: 'Type de ressource',
  supported_scopes: 'Portées autorisées',
  risk_level: 'Niveau de risque',
  version: 'Version',
  metadata: 'Métadonnées',
  payload: 'Charge utile',
  preferences: 'Préférences',
  configuration: 'Configuration',
  enabled: 'Activé',
  key: 'Clé',
  value: 'Valeur',
  value_type: 'Type de valeur',
  category: 'Catégorie',
  unit: 'Unité',
  document_kinds: 'Types de document',
  resolution_strategy: 'Stratégie de résolution',
  change_permission_code: 'Permission de modification',
  validation_rules: 'Règles de validation',
  setting_key: 'Paramètre',
  allow_null: 'Autorise vide',
  action: 'Action',
  entity_type: "Type d'entité",
  entity_id: "Identifiant d'entité",
  source_schema: 'Schéma source',
  request_id: 'Identifiant de requête',
  token_hash: 'Empreinte du jeton',
  subject_type: 'Type de sujet',
  party_id: 'Identifiant du tiers',
  can_act_on_behalf: 'Peut agir pour le compte',
  // amounts and quantities (suffix-matched below when not listed exactly)
  sale_price: 'Prix de vente',
  cost_price: "Prix d'achat",
  price: 'Prix',
  quantity: 'Quantité',
  qty: 'Quantité',
  stock: 'Stock',
  min_stock: 'Stock minimum',
  reorder_level: 'Seuil de réapprovisionnement',
  amount: 'Montant',
  total: 'Total',
  subtotal: 'Sous-total',
  tax_amount: 'Montant TVA',
  discount_amount: 'Remise',
  paid_amount: 'Montant payé',
  balance: 'Solde',
  due_date: 'Échéance',
  issued_at: 'Émis le',
  order_date: 'Date de commande',
  delivery_date: 'Date de livraison',
  document_number: 'Numéro',
  document_kind: 'Type de document',
  warehouse_id: 'Dépôt',
  customer_id: 'Client',
  supplier_id: 'Fournisseur',
  product_id: 'Article',
  category_id: 'Catégorie',
  brand_id: 'Marque',
  order_id: 'Commande',
  payment_id: 'Paiement',
  role_id: 'Rôle',
  user_id: 'Utilisateur',
  permission_id: 'Permission',
  embedding: 'Vecteur de recherche',
  full_name_ar: 'Nom complet (arabe)',
  tags: 'Étiquettes',
  image_url: 'Image',
  name_ar: 'Nom (arabe)',
  role_code: 'Code du rôle',
};

const wordReplacements = [
  [/_id$/, ' (référence)'],
  [/^is_/, ''],
  [/_count$/, ' (nombre)'],
  [/_at$/, ' (date)'],
  [/_date$/, ' (date)'],
];

/** Humanise a snake_case identifier into a readable French-ish label. */
export function humanize(name) {
  if (!name) return '';
  let value = name;
  for (const [pattern, replacement] of wordReplacements) value = value.replace(pattern, replacement);
  value = value.replace(/_/g, ' ').trim();
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** Label for a table key such as `erp.products`. */
export function tableLabel(key) {
  return tableLabels[key] ?? humanize(key.split('.').pop());
}

/** Label for a column, with a fallback that never throws. */
export function columnLabel(columnName) {
  return columnLabels[columnName] ?? humanize(columnName);
}
