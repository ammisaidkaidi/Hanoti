/**
 * GENERATED FILE — do not edit by hand.
 *
 * Produced by scripts/generate-schema.mjs from the hanouti SQL declarations
 * (../../backend/hanoti-structure/.test/data/fixtures/schema-manifest.json).
 *
 * Regenerate with:  npm run schema:generate
 *
 * Generated at 2026-10-16T00:27:09.847Z
 * 30 tables across 4 schemas.
 */

/** Migrations the manifest hashes cover, in deployment order. */
export const manifestFiles = [
  "migrations/hanouti/001_schemas.sql",
  "migrations/hanouti/002_auth.sql",
  "migrations/hanouti/003_erp.sql",
  "migrations/hanouti/004_app.sql",
  "migrations/hanouti/005_settings.sql",
  "migrations/hanouti/006_auth_party_permissions.sql",
  "migrations/hanouti/007_authorization_routines.sql",
  "migrations/hanouti/008_settings_routines.sql",
  "migrations/hanouti/009_erp_routines.sql",
  "migrations/hanouti/010_row_guards.sql",
  "migrations/hanouti/011_order_edit_routines.sql"
];

/** Table counts per schema, as declared. */
export const schemaCounts = {
  "erp": 12,
  "auth": 10,
  "app": 5,
  "settings": 3
};

/** Every declared table, with its columns exactly as the SQL declares them. */
export const entities = [
  {
    "key": "erp.brands",
    "schema": "erp",
    "table": "brands",
    "className": "Brand",
    "columns": [
      {
        "name": "frozen",
        "property": "frozen",
        "type": "boolean",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "FALSE",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "id",
        "property": "id",
        "type": "uuid",
        "nullable": false,
        "primary": true,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "gen_random_uuid()",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "name",
        "property": "name",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 160,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "is_active",
        "property": "isActive",
        "type": "boolean",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "TRUE",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "created_at",
        "property": "createdAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "updated_at",
        "property": "updatedAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": true,
        "sensitive": false
      }
    ],
    "primaryKey": "id",
    "labelColumn": "name",
    "listColumns": [
      "id",
      "name",
      "is_active"
    ],
    "hasSensitiveColumns": false,
    "foreignKeys": [],
    "uniqueColumns": []
  },
  {
    "key": "erp.categories",
    "schema": "erp",
    "table": "categories",
    "className": "Category",
    "columns": [
      {
        "name": "frozen",
        "property": "frozen",
        "type": "boolean",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "FALSE",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "id",
        "property": "id",
        "type": "uuid",
        "nullable": false,
        "primary": true,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "gen_random_uuid()",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "parent_id",
        "property": "parentId",
        "type": "uuid",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "code",
        "property": "code",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 64,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "name",
        "property": "name",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 160,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "is_active",
        "property": "isActive",
        "type": "boolean",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "TRUE",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "created_at",
        "property": "createdAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "updated_at",
        "property": "updatedAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": true,
        "sensitive": false
      }
    ],
    "primaryKey": "id",
    "labelColumn": "name",
    "listColumns": [
      "id",
      "parent_id",
      "code",
      "name",
      "is_active"
    ],
    "hasSensitiveColumns": false,
    "foreignKeys": [
      {
        "target": "categories",
        "schema": "erp",
        "columns": [
          "parent_id"
        ],
        "referencedColumns": [
          "id"
        ],
        "onDelete": "RESTRICT"
      }
    ],
    "uniqueColumns": [
      [
        "code"
      ]
    ]
  },
  {
    "key": "erp.customers",
    "schema": "erp",
    "table": "customers",
    "className": "Customer",
    "columns": [
      {
        "name": "frozen",
        "property": "frozen",
        "type": "boolean",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "FALSE",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "id",
        "property": "id",
        "type": "uuid",
        "nullable": false,
        "primary": true,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "gen_random_uuid()",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "code",
        "property": "code",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 64,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "name",
        "property": "name",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 240,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "party_type",
        "property": "partyType",
        "type": "varchar",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": 16,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "first_name",
        "property": "firstName",
        "type": "varchar",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": 120,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "last_name",
        "property": "lastName",
        "type": "varchar",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": 120,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "legal_name",
        "property": "legalName",
        "type": "varchar",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": 240,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "legal_form",
        "property": "legalForm",
        "type": "varchar",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": 80,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "job_title",
        "property": "jobTitle",
        "type": "text",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "job_info",
        "property": "jobInfo",
        "type": "text",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "business_activity",
        "property": "businessActivity",
        "type": "text",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "activity_code",
        "property": "activityCode",
        "type": "varchar",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": 32,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "contact_person_name",
        "property": "contactPersonName",
        "type": "varchar",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": 240,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "email",
        "property": "email",
        "type": "varchar",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": 320,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "phone",
        "property": "phone",
        "type": "varchar",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": 32,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "fax",
        "property": "fax",
        "type": "varchar",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": 32,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "nif",
        "property": "nif",
        "type": "varchar",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": 20,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "nis",
        "property": "nis",
        "type": "varchar",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": 18,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "rc",
        "property": "rc",
        "type": "varchar",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": 64,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "nin",
        "property": "nin",
        "type": "varchar",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": 18,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "article_imposition",
        "property": "articleImposition",
        "type": "varchar",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": 32,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "professional_registration_type",
        "property": "professionalRegistrationType",
        "type": "varchar",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": 80,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "professional_registration_number",
        "property": "professionalRegistrationNumber",
        "type": "varchar",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": 128,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "share_capital",
        "property": "shareCapital",
        "type": "numeric",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": 20,
        "scale": 2,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "share_capital_currency",
        "property": "shareCapitalCurrency",
        "type": "varchar",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": 3,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "tax_identifier",
        "property": "taxIdentifier",
        "type": "varchar",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": 80,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "address",
        "property": "address",
        "type": "jsonb",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CAST('{}' AS jsonb)",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "embedding",
        "property": "embedding",
        "type": "vector",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": 4096,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "is_active",
        "property": "isActive",
        "type": "boolean",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "TRUE",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "created_at",
        "property": "createdAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "updated_at",
        "property": "updatedAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": true,
        "sensitive": false
      }
    ],
    "primaryKey": "id",
    "labelColumn": "name",
    "listColumns": [
      "id",
      "code",
      "name",
      "party_type",
      "first_name",
      "last_name",
      "legal_name",
      "legal_form",
      "job_title",
      "job_info",
      "business_activity",
      "activity_code",
      "contact_person_name",
      "email",
      "phone",
      "fax",
      "nif",
      "nis",
      "rc",
      "nin",
      "article_imposition",
      "professional_registration_type",
      "professional_registration_number",
      "share_capital",
      "share_capital_currency",
      "tax_identifier",
      "address",
      "embedding",
      "is_active"
    ],
    "hasSensitiveColumns": false,
    "foreignKeys": [],
    "uniqueColumns": [
      [
        "code"
      ]
    ]
  },
  {
    "key": "erp.payments",
    "schema": "erp",
    "table": "payments",
    "className": "Payment",
    "columns": [
      {
        "name": "frozen",
        "property": "frozen",
        "type": "boolean",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "FALSE",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "id",
        "property": "id",
        "type": "uuid",
        "nullable": false,
        "primary": true,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "gen_random_uuid()",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "sales_order_id",
        "property": "salesOrderId",
        "type": "uuid",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "currency_code",
        "property": "currencyCode",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 3,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "direction",
        "property": "direction",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 8,
        "precision": null,
        "scale": null,
        "default": "'receipt'",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "method",
        "property": "method",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 16,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "status",
        "property": "status",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 16,
        "precision": null,
        "scale": null,
        "default": "'pending'",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "amount",
        "property": "amount",
        "type": "numeric",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": 18,
        "scale": 4,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "provider",
        "property": "provider",
        "type": "varchar",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": 80,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "provider_reference",
        "property": "providerReference",
        "type": "varchar",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": 160,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "idempotency_key",
        "property": "idempotencyKey",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 128,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "recorded_by_user_id",
        "property": "recordedByUserId",
        "type": "uuid",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "paid_at",
        "property": "paidAt",
        "type": "timestamptz",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "created_at",
        "property": "createdAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "updated_at",
        "property": "updatedAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": true,
        "sensitive": false
      }
    ],
    "primaryKey": "id",
    "labelColumn": "id",
    "listColumns": [
      "id",
      "sales_order_id",
      "currency_code",
      "direction",
      "method",
      "status",
      "amount",
      "provider",
      "provider_reference",
      "idempotency_key",
      "recorded_by_user_id",
      "paid_at"
    ],
    "hasSensitiveColumns": false,
    "foreignKeys": [
      {
        "target": "users",
        "schema": "auth",
        "columns": [
          "recorded_by_user_id"
        ],
        "referencedColumns": [
          "id"
        ],
        "onDelete": "SET NULL"
      },
      {
        "target": "sales_orders",
        "schema": "erp",
        "columns": [
          "sales_order_id",
          "currency_code"
        ],
        "referencedColumns": [
          "id",
          "currency_code"
        ],
        "onDelete": "RESTRICT"
      }
    ],
    "uniqueColumns": [
      [
        "idempotency_key"
      ]
    ]
  },
  {
    "key": "erp.products",
    "schema": "erp",
    "table": "products",
    "className": "Product",
    "columns": [
      {
        "name": "frozen",
        "property": "frozen",
        "type": "boolean",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "FALSE",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "id",
        "property": "id",
        "type": "uuid",
        "nullable": false,
        "primary": true,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "gen_random_uuid()",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "sku",
        "property": "sku",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 80,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "barcode",
        "property": "barcode",
        "type": "varchar",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": 128,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "abbreviation",
        "property": "abbreviation",
        "type": "text",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "name",
        "property": "name",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 240,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "full_name",
        "property": "fullName",
        "type": "text",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "attributes",
        "property": "attributes",
        "type": "text",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "material",
        "property": "material",
        "type": "text",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "dimensions",
        "property": "dimensions",
        "type": "text",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "color",
        "property": "color",
        "type": "text",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "brand_id",
        "property": "brandId",
        "type": "uuid",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "series",
        "property": "series",
        "type": "text",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "made_in",
        "property": "madeIn",
        "type": "text",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "quality",
        "property": "quality",
        "type": "text",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "reference",
        "property": "reference",
        "type": "text",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "embedding",
        "property": "embedding",
        "type": "vector",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": 4096,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "description",
        "property": "description",
        "type": "text",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "category_id",
        "property": "categoryId",
        "type": "uuid",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "kind",
        "property": "kind",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 16,
        "precision": null,
        "scale": null,
        "default": "'stock'",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "unit_code",
        "property": "unitCode",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 16,
        "precision": null,
        "scale": null,
        "default": "'each'",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "currency_code",
        "property": "currencyCode",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 3,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "sale_price",
        "property": "salePrice",
        "type": "numeric",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": 18,
        "scale": 4,
        "default": "0",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "reorder_level",
        "property": "reorderLevel",
        "type": "numeric",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": 18,
        "scale": 3,
        "default": "0",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "tags",
        "property": "tags",
        "type": "text",
        "nullable": false,
        "primary": false,
        "array": true,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "'{}'",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "metadata",
        "property": "metadata",
        "type": "jsonb",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CAST('{}' AS jsonb)",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "is_active",
        "property": "isActive",
        "type": "boolean",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "TRUE",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "created_at",
        "property": "createdAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "updated_at",
        "property": "updatedAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": true,
        "sensitive": false
      }
    ],
    "primaryKey": "id",
    "labelColumn": "name",
    "listColumns": [
      "id",
      "sku",
      "barcode",
      "abbreviation",
      "name",
      "full_name",
      "attributes",
      "material",
      "dimensions",
      "color",
      "brand_id",
      "series",
      "made_in",
      "quality",
      "reference",
      "embedding",
      "description",
      "category_id",
      "kind",
      "unit_code",
      "currency_code",
      "sale_price",
      "reorder_level",
      "tags",
      "metadata",
      "is_active"
    ],
    "hasSensitiveColumns": false,
    "foreignKeys": [
      {
        "target": "brands",
        "schema": "erp",
        "columns": [
          "brand_id"
        ],
        "referencedColumns": [
          "id"
        ],
        "onDelete": "RESTRICT"
      },
      {
        "target": "categories",
        "schema": "erp",
        "columns": [
          "category_id"
        ],
        "referencedColumns": [
          "id"
        ],
        "onDelete": "RESTRICT"
      }
    ],
    "uniqueColumns": [
      [
        "barcode"
      ]
    ]
  },
  {
    "key": "erp.purchase_order_items",
    "schema": "erp",
    "table": "purchase_order_items",
    "className": "PurchaseOrderItem",
    "columns": [
      {
        "name": "frozen",
        "property": "frozen",
        "type": "boolean",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "FALSE",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "updated_at",
        "property": "updatedAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "id",
        "property": "id",
        "type": "uuid",
        "nullable": false,
        "primary": true,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "gen_random_uuid()",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "purchase_order_id",
        "property": "purchaseOrderId",
        "type": "uuid",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "line_number",
        "property": "lineNumber",
        "type": "integer",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "product_id",
        "property": "productId",
        "type": "uuid",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "sku_snapshot",
        "property": "skuSnapshot",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 80,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "full_name",
        "property": "fullName",
        "type": "text",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "description",
        "property": "description",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 500,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "unit_code",
        "property": "unitCode",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 16,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "quantity",
        "property": "quantity",
        "type": "numeric",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": 18,
        "scale": 3,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "unit_cost",
        "property": "unitCost",
        "type": "numeric",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": 18,
        "scale": 4,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "discount_amount",
        "property": "discountAmount",
        "type": "numeric",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": 18,
        "scale": 4,
        "default": "0",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "tax_amount",
        "property": "taxAmount",
        "type": "numeric",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": 18,
        "scale": 4,
        "default": "0",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "line_total",
        "property": "lineTotal",
        "type": "numeric",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": 24,
        "scale": 4,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "created_at",
        "property": "createdAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": true,
        "sensitive": false
      }
    ],
    "primaryKey": "id",
    "labelColumn": "full_name",
    "listColumns": [
      "id",
      "purchase_order_id",
      "line_number",
      "product_id",
      "sku_snapshot",
      "full_name",
      "description",
      "unit_code",
      "quantity",
      "unit_cost",
      "discount_amount",
      "tax_amount",
      "line_total"
    ],
    "hasSensitiveColumns": false,
    "foreignKeys": [
      {
        "target": "purchase_orders",
        "schema": "erp",
        "columns": [
          "purchase_order_id"
        ],
        "referencedColumns": [
          "id"
        ],
        "onDelete": "RESTRICT"
      },
      {
        "target": "products",
        "schema": "erp",
        "columns": [
          "product_id"
        ],
        "referencedColumns": [
          "id"
        ],
        "onDelete": "RESTRICT"
      }
    ],
    "uniqueColumns": [
      [
        "purchase_order_id",
        "line_number"
      ],
      [
        "id",
        "product_id"
      ]
    ]
  },
  {
    "key": "erp.purchase_orders",
    "schema": "erp",
    "table": "purchase_orders",
    "className": "PurchaseOrder",
    "columns": [
      {
        "name": "frozen",
        "property": "frozen",
        "type": "boolean",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "FALSE",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "locked_by",
        "property": "lockedBy",
        "type": "uuid",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "locked_at",
        "property": "lockedAt",
        "type": "timestamptz",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "lock_version",
        "property": "lockVersion",
        "type": "bigint",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "0",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "id",
        "property": "id",
        "type": "uuid",
        "nullable": false,
        "primary": true,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "gen_random_uuid()",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "order_number",
        "property": "orderNumber",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 64,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "supplier_id",
        "property": "supplierId",
        "type": "uuid",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "warehouse_id",
        "property": "warehouseId",
        "type": "uuid",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "status",
        "property": "status",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 20,
        "precision": null,
        "scale": null,
        "default": "'draft'",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "currency_code",
        "property": "currencyCode",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 3,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "supplier_snapshot",
        "property": "supplierSnapshot",
        "type": "jsonb",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CAST('{}' AS jsonb)",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "expected_on",
        "property": "expectedOn",
        "type": "date",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "notes",
        "property": "notes",
        "type": "text",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "created_by_user_id",
        "property": "createdByUserId",
        "type": "uuid",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "ordered_at",
        "property": "orderedAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "received_at",
        "property": "receivedAt",
        "type": "timestamptz",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "cancelled_at",
        "property": "cancelledAt",
        "type": "timestamptz",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "created_at",
        "property": "createdAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "updated_at",
        "property": "updatedAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": true,
        "sensitive": false
      }
    ],
    "primaryKey": "id",
    "labelColumn": "id",
    "listColumns": [
      "locked_by",
      "locked_at",
      "lock_version",
      "id",
      "order_number",
      "supplier_id",
      "warehouse_id",
      "status",
      "currency_code",
      "supplier_snapshot",
      "expected_on",
      "notes",
      "created_by_user_id",
      "ordered_at",
      "received_at",
      "cancelled_at"
    ],
    "hasSensitiveColumns": false,
    "foreignKeys": [
      {
        "target": "users",
        "schema": "auth",
        "columns": [
          "locked_by"
        ],
        "referencedColumns": [
          "id"
        ],
        "onDelete": "RESTRICT"
      },
      {
        "target": "suppliers",
        "schema": "erp",
        "columns": [
          "supplier_id"
        ],
        "referencedColumns": [
          "id"
        ],
        "onDelete": "RESTRICT"
      },
      {
        "target": "warehouses",
        "schema": "erp",
        "columns": [
          "warehouse_id"
        ],
        "referencedColumns": [
          "id"
        ],
        "onDelete": "RESTRICT"
      },
      {
        "target": "users",
        "schema": "auth",
        "columns": [
          "created_by_user_id"
        ],
        "referencedColumns": [
          "id"
        ],
        "onDelete": "SET NULL"
      }
    ],
    "uniqueColumns": [
      [
        "order_number"
      ]
    ]
  },
  {
    "key": "erp.sales_order_items",
    "schema": "erp",
    "table": "sales_order_items",
    "className": "SalesOrderItem",
    "columns": [
      {
        "name": "frozen",
        "property": "frozen",
        "type": "boolean",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "FALSE",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "updated_at",
        "property": "updatedAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "id",
        "property": "id",
        "type": "uuid",
        "nullable": false,
        "primary": true,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "gen_random_uuid()",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "sales_order_id",
        "property": "salesOrderId",
        "type": "uuid",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "line_number",
        "property": "lineNumber",
        "type": "integer",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "product_id",
        "property": "productId",
        "type": "uuid",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "sku_snapshot",
        "property": "skuSnapshot",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 80,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "full_name",
        "property": "fullName",
        "type": "text",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "description",
        "property": "description",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 500,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "unit_code",
        "property": "unitCode",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 16,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "quantity",
        "property": "quantity",
        "type": "numeric",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": 18,
        "scale": 3,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "unit_price",
        "property": "unitPrice",
        "type": "numeric",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": 18,
        "scale": 4,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "discount_amount",
        "property": "discountAmount",
        "type": "numeric",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": 18,
        "scale": 4,
        "default": "0",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "tax_amount",
        "property": "taxAmount",
        "type": "numeric",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": 18,
        "scale": 4,
        "default": "0",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "line_total",
        "property": "lineTotal",
        "type": "numeric",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": 24,
        "scale": 4,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "created_at",
        "property": "createdAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": true,
        "sensitive": false
      }
    ],
    "primaryKey": "id",
    "labelColumn": "full_name",
    "listColumns": [
      "id",
      "sales_order_id",
      "line_number",
      "product_id",
      "sku_snapshot",
      "full_name",
      "description",
      "unit_code",
      "quantity",
      "unit_price",
      "discount_amount",
      "tax_amount",
      "line_total"
    ],
    "hasSensitiveColumns": false,
    "foreignKeys": [
      {
        "target": "sales_orders",
        "schema": "erp",
        "columns": [
          "sales_order_id"
        ],
        "referencedColumns": [
          "id"
        ],
        "onDelete": "RESTRICT"
      },
      {
        "target": "products",
        "schema": "erp",
        "columns": [
          "product_id"
        ],
        "referencedColumns": [
          "id"
        ],
        "onDelete": "RESTRICT"
      }
    ],
    "uniqueColumns": [
      [
        "sales_order_id",
        "line_number"
      ],
      [
        "id",
        "product_id"
      ]
    ]
  },
  {
    "key": "erp.sales_orders",
    "schema": "erp",
    "table": "sales_orders",
    "className": "SalesOrder",
    "columns": [
      {
        "name": "frozen",
        "property": "frozen",
        "type": "boolean",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "FALSE",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "locked_by",
        "property": "lockedBy",
        "type": "uuid",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "locked_at",
        "property": "lockedAt",
        "type": "timestamptz",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "lock_version",
        "property": "lockVersion",
        "type": "bigint",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "0",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "id",
        "property": "id",
        "type": "uuid",
        "nullable": false,
        "primary": true,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "gen_random_uuid()",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "order_number",
        "property": "orderNumber",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 64,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "customer_id",
        "property": "customerId",
        "type": "uuid",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "warehouse_id",
        "property": "warehouseId",
        "type": "uuid",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "status",
        "property": "status",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 16,
        "precision": null,
        "scale": null,
        "default": "'draft'",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "currency_code",
        "property": "currencyCode",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 3,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "customer_snapshot",
        "property": "customerSnapshot",
        "type": "jsonb",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CAST('{}' AS jsonb)",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "notes",
        "property": "notes",
        "type": "text",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "created_by_user_id",
        "property": "createdByUserId",
        "type": "uuid",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "ordered_at",
        "property": "orderedAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "fulfilled_at",
        "property": "fulfilledAt",
        "type": "timestamptz",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "cancelled_at",
        "property": "cancelledAt",
        "type": "timestamptz",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "created_at",
        "property": "createdAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "updated_at",
        "property": "updatedAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": true,
        "sensitive": false
      }
    ],
    "primaryKey": "id",
    "labelColumn": "id",
    "listColumns": [
      "locked_by",
      "locked_at",
      "lock_version",
      "id",
      "order_number",
      "customer_id",
      "warehouse_id",
      "status",
      "currency_code",
      "customer_snapshot",
      "notes",
      "created_by_user_id",
      "ordered_at",
      "fulfilled_at",
      "cancelled_at"
    ],
    "hasSensitiveColumns": false,
    "foreignKeys": [
      {
        "target": "users",
        "schema": "auth",
        "columns": [
          "locked_by"
        ],
        "referencedColumns": [
          "id"
        ],
        "onDelete": "RESTRICT"
      },
      {
        "target": "customers",
        "schema": "erp",
        "columns": [
          "customer_id"
        ],
        "referencedColumns": [
          "id"
        ],
        "onDelete": "RESTRICT"
      },
      {
        "target": "warehouses",
        "schema": "erp",
        "columns": [
          "warehouse_id"
        ],
        "referencedColumns": [
          "id"
        ],
        "onDelete": "RESTRICT"
      },
      {
        "target": "users",
        "schema": "auth",
        "columns": [
          "created_by_user_id"
        ],
        "referencedColumns": [
          "id"
        ],
        "onDelete": "SET NULL"
      }
    ],
    "uniqueColumns": [
      [
        "order_number"
      ],
      [
        "id",
        "currency_code"
      ]
    ]
  },
  {
    "key": "erp.stock_movements",
    "schema": "erp",
    "table": "stock_movements",
    "className": "StockMovement",
    "columns": [
      {
        "name": "frozen",
        "property": "frozen",
        "type": "boolean",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "FALSE",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "updated_at",
        "property": "updatedAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "id",
        "property": "id",
        "type": "uuid",
        "nullable": false,
        "primary": true,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "gen_random_uuid()",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "product_id",
        "property": "productId",
        "type": "uuid",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "warehouse_id",
        "property": "warehouseId",
        "type": "uuid",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "kind",
        "property": "kind",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 16,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "quantity_delta",
        "property": "quantityDelta",
        "type": "numeric",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": 18,
        "scale": 3,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "sales_order_item_id",
        "property": "salesOrderItemId",
        "type": "uuid",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "purchase_order_item_id",
        "property": "purchaseOrderItemId",
        "type": "uuid",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "transfer_group_id",
        "property": "transferGroupId",
        "type": "uuid",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "idempotency_key",
        "property": "idempotencyKey",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 128,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "reason",
        "property": "reason",
        "type": "text",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "recorded_by_user_id",
        "property": "recordedByUserId",
        "type": "uuid",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "occurred_at",
        "property": "occurredAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "created_at",
        "property": "createdAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": true,
        "sensitive": false
      }
    ],
    "primaryKey": "id",
    "labelColumn": "id",
    "listColumns": [
      "id",
      "product_id",
      "warehouse_id",
      "kind",
      "quantity_delta",
      "sales_order_item_id",
      "purchase_order_item_id",
      "transfer_group_id",
      "idempotency_key",
      "reason",
      "recorded_by_user_id",
      "occurred_at"
    ],
    "hasSensitiveColumns": false,
    "foreignKeys": [
      {
        "target": "products",
        "schema": "erp",
        "columns": [
          "product_id"
        ],
        "referencedColumns": [
          "id"
        ],
        "onDelete": "RESTRICT"
      },
      {
        "target": "warehouses",
        "schema": "erp",
        "columns": [
          "warehouse_id"
        ],
        "referencedColumns": [
          "id"
        ],
        "onDelete": "RESTRICT"
      },
      {
        "target": "users",
        "schema": "auth",
        "columns": [
          "recorded_by_user_id"
        ],
        "referencedColumns": [
          "id"
        ],
        "onDelete": "SET NULL"
      },
      {
        "target": "sales_order_items",
        "schema": "erp",
        "columns": [
          "sales_order_item_id",
          "product_id"
        ],
        "referencedColumns": [
          "id",
          "product_id"
        ],
        "onDelete": "RESTRICT"
      },
      {
        "target": "purchase_order_items",
        "schema": "erp",
        "columns": [
          "purchase_order_item_id",
          "product_id"
        ],
        "referencedColumns": [
          "id",
          "product_id"
        ],
        "onDelete": "RESTRICT"
      }
    ],
    "uniqueColumns": [
      [
        "idempotency_key"
      ]
    ]
  },
  {
    "key": "erp.suppliers",
    "schema": "erp",
    "table": "suppliers",
    "className": "Supplier",
    "columns": [
      {
        "name": "frozen",
        "property": "frozen",
        "type": "boolean",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "FALSE",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "id",
        "property": "id",
        "type": "uuid",
        "nullable": false,
        "primary": true,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "gen_random_uuid()",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "code",
        "property": "code",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 64,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "name",
        "property": "name",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 240,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "party_type",
        "property": "partyType",
        "type": "varchar",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": 16,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "first_name",
        "property": "firstName",
        "type": "varchar",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": 120,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "last_name",
        "property": "lastName",
        "type": "varchar",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": 120,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "legal_name",
        "property": "legalName",
        "type": "varchar",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": 240,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "legal_form",
        "property": "legalForm",
        "type": "varchar",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": 80,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "job_title",
        "property": "jobTitle",
        "type": "text",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "job_info",
        "property": "jobInfo",
        "type": "text",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "business_activity",
        "property": "businessActivity",
        "type": "text",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "activity_code",
        "property": "activityCode",
        "type": "varchar",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": 32,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "contact_person_name",
        "property": "contactPersonName",
        "type": "varchar",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": 240,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "email",
        "property": "email",
        "type": "varchar",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": 320,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "phone",
        "property": "phone",
        "type": "varchar",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": 32,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "fax",
        "property": "fax",
        "type": "varchar",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": 32,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "nif",
        "property": "nif",
        "type": "varchar",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": 20,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "nis",
        "property": "nis",
        "type": "varchar",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": 18,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "rc",
        "property": "rc",
        "type": "varchar",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": 64,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "nin",
        "property": "nin",
        "type": "varchar",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": 18,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "article_imposition",
        "property": "articleImposition",
        "type": "varchar",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": 32,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "professional_registration_type",
        "property": "professionalRegistrationType",
        "type": "varchar",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": 80,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "professional_registration_number",
        "property": "professionalRegistrationNumber",
        "type": "varchar",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": 128,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "share_capital",
        "property": "shareCapital",
        "type": "numeric",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": 20,
        "scale": 2,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "share_capital_currency",
        "property": "shareCapitalCurrency",
        "type": "varchar",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": 3,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "tax_identifier",
        "property": "taxIdentifier",
        "type": "varchar",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": 80,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "address",
        "property": "address",
        "type": "jsonb",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CAST('{}' AS jsonb)",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "is_active",
        "property": "isActive",
        "type": "boolean",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "TRUE",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "created_at",
        "property": "createdAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "updated_at",
        "property": "updatedAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": true,
        "sensitive": false
      }
    ],
    "primaryKey": "id",
    "labelColumn": "name",
    "listColumns": [
      "id",
      "code",
      "name",
      "party_type",
      "first_name",
      "last_name",
      "legal_name",
      "legal_form",
      "job_title",
      "job_info",
      "business_activity",
      "activity_code",
      "contact_person_name",
      "email",
      "phone",
      "fax",
      "nif",
      "nis",
      "rc",
      "nin",
      "article_imposition",
      "professional_registration_type",
      "professional_registration_number",
      "share_capital",
      "share_capital_currency",
      "tax_identifier",
      "address",
      "is_active"
    ],
    "hasSensitiveColumns": false,
    "foreignKeys": [],
    "uniqueColumns": [
      [
        "code"
      ]
    ]
  },
  {
    "key": "erp.warehouses",
    "schema": "erp",
    "table": "warehouses",
    "className": "Warehouse",
    "columns": [
      {
        "name": "frozen",
        "property": "frozen",
        "type": "boolean",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "FALSE",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "id",
        "property": "id",
        "type": "uuid",
        "nullable": false,
        "primary": true,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "gen_random_uuid()",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "code",
        "property": "code",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 64,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "name",
        "property": "name",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 160,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "address",
        "property": "address",
        "type": "jsonb",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CAST('{}' AS jsonb)",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "is_active",
        "property": "isActive",
        "type": "boolean",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "TRUE",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "created_at",
        "property": "createdAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "updated_at",
        "property": "updatedAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": true,
        "sensitive": false
      }
    ],
    "primaryKey": "id",
    "labelColumn": "name",
    "listColumns": [
      "id",
      "code",
      "name",
      "address",
      "is_active"
    ],
    "hasSensitiveColumns": false,
    "foreignKeys": [],
    "uniqueColumns": [
      [
        "code"
      ]
    ]
  },
  {
    "key": "auth.email_verification_tokens",
    "schema": "auth",
    "table": "email_verification_tokens",
    "className": "EmailVerificationToken",
    "columns": [
      {
        "name": "frozen",
        "property": "frozen",
        "type": "boolean",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "FALSE",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "updated_at",
        "property": "updatedAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "id",
        "property": "id",
        "type": "uuid",
        "nullable": false,
        "primary": true,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "gen_random_uuid()",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "user_id",
        "property": "userId",
        "type": "uuid",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "email",
        "property": "email",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 320,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "token_hash",
        "property": "tokenHash",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 64,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": true
      },
      {
        "name": "created_at",
        "property": "createdAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "expires_at",
        "property": "expiresAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "used_at",
        "property": "usedAt",
        "type": "timestamptz",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      }
    ],
    "primaryKey": "id",
    "labelColumn": "email",
    "listColumns": [
      "id",
      "user_id",
      "email",
      "expires_at",
      "used_at"
    ],
    "hasSensitiveColumns": true,
    "foreignKeys": [
      {
        "target": "users",
        "schema": "auth",
        "columns": [
          "user_id"
        ],
        "referencedColumns": [
          "id"
        ],
        "onDelete": "CASCADE"
      }
    ],
    "uniqueColumns": [
      [
        "token_hash"
      ]
    ]
  },
  {
    "key": "auth.party_memberships",
    "schema": "auth",
    "table": "party_memberships",
    "className": "PartyMembership",
    "columns": [
      {
        "name": "frozen",
        "property": "frozen",
        "type": "boolean",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "FALSE",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "id",
        "property": "id",
        "type": "uuid",
        "nullable": false,
        "primary": true,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "gen_random_uuid()",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "user_id",
        "property": "userId",
        "type": "uuid",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "party_type",
        "property": "partyType",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 8,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "party_id",
        "property": "partyId",
        "type": "uuid",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "status",
        "property": "status",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 12,
        "precision": null,
        "scale": null,
        "default": "'pending'",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "can_act_on_behalf",
        "property": "canActOnBehalf",
        "type": "boolean",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "FALSE",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "verified_at",
        "property": "verifiedAt",
        "type": "timestamptz",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "verified_by_user_id",
        "property": "verifiedByUserId",
        "type": "uuid",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "valid_from",
        "property": "validFrom",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "valid_until",
        "property": "validUntil",
        "type": "timestamptz",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "revoked_at",
        "property": "revokedAt",
        "type": "timestamptz",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "revoked_by_user_id",
        "property": "revokedByUserId",
        "type": "uuid",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "change_reason",
        "property": "changeReason",
        "type": "text",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "created_by_user_id",
        "property": "createdByUserId",
        "type": "uuid",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "updated_by_user_id",
        "property": "updatedByUserId",
        "type": "uuid",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "created_at",
        "property": "createdAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "updated_at",
        "property": "updatedAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "version",
        "property": "version",
        "type": "integer",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "1",
        "audit": true,
        "sensitive": false
      }
    ],
    "primaryKey": "id",
    "labelColumn": "id",
    "listColumns": [
      "id",
      "user_id",
      "party_type",
      "party_id",
      "status",
      "can_act_on_behalf",
      "verified_at",
      "verified_by_user_id",
      "valid_from",
      "valid_until",
      "revoked_at",
      "revoked_by_user_id",
      "change_reason",
      "created_by_user_id",
      "updated_by_user_id"
    ],
    "hasSensitiveColumns": false,
    "foreignKeys": [
      {
        "target": "users",
        "schema": "auth",
        "columns": [
          "user_id"
        ],
        "referencedColumns": [
          "id"
        ],
        "onDelete": "CASCADE"
      },
      {
        "target": "users",
        "schema": "auth",
        "columns": [
          "verified_by_user_id"
        ],
        "referencedColumns": [
          "id"
        ],
        "onDelete": "SET NULL"
      },
      {
        "target": "users",
        "schema": "auth",
        "columns": [
          "revoked_by_user_id"
        ],
        "referencedColumns": [
          "id"
        ],
        "onDelete": "SET NULL"
      },
      {
        "target": "users",
        "schema": "auth",
        "columns": [
          "created_by_user_id"
        ],
        "referencedColumns": [
          "id"
        ],
        "onDelete": "SET NULL"
      },
      {
        "target": "users",
        "schema": "auth",
        "columns": [
          "updated_by_user_id"
        ],
        "referencedColumns": [
          "id"
        ],
        "onDelete": "SET NULL"
      }
    ],
    "uniqueColumns": [
      [
        "user_id",
        "party_type",
        "party_id"
      ]
    ]
  },
  {
    "key": "auth.password_reset_tokens",
    "schema": "auth",
    "table": "password_reset_tokens",
    "className": "PasswordResetToken",
    "columns": [
      {
        "name": "frozen",
        "property": "frozen",
        "type": "boolean",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "FALSE",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "updated_at",
        "property": "updatedAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "id",
        "property": "id",
        "type": "uuid",
        "nullable": false,
        "primary": true,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "gen_random_uuid()",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "user_id",
        "property": "userId",
        "type": "uuid",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "token_hash",
        "property": "tokenHash",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 64,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": true
      },
      {
        "name": "created_at",
        "property": "createdAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "expires_at",
        "property": "expiresAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "used_at",
        "property": "usedAt",
        "type": "timestamptz",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      }
    ],
    "primaryKey": "id",
    "labelColumn": "id",
    "listColumns": [
      "id",
      "user_id",
      "expires_at",
      "used_at"
    ],
    "hasSensitiveColumns": true,
    "foreignKeys": [
      {
        "target": "users",
        "schema": "auth",
        "columns": [
          "user_id"
        ],
        "referencedColumns": [
          "id"
        ],
        "onDelete": "CASCADE"
      }
    ],
    "uniqueColumns": [
      [
        "token_hash"
      ]
    ]
  },
  {
    "key": "auth.permissions",
    "schema": "auth",
    "table": "permissions",
    "className": "Permission",
    "columns": [
      {
        "name": "frozen",
        "property": "frozen",
        "type": "boolean",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "FALSE",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "updated_at",
        "property": "updatedAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "id",
        "property": "id",
        "type": "uuid",
        "nullable": false,
        "primary": true,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "gen_random_uuid()",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "code",
        "property": "code",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 128,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "description",
        "property": "description",
        "type": "text",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "resource_type",
        "property": "resourceType",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 80,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "supported_scopes",
        "property": "supportedScopes",
        "type": "text",
        "nullable": false,
        "primary": false,
        "array": true,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "risk_level",
        "property": "riskLevel",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 12,
        "precision": null,
        "scale": null,
        "default": "'normal'",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "is_delegable",
        "property": "isDelegable",
        "type": "boolean",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "FALSE",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "created_at",
        "property": "createdAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": true,
        "sensitive": false
      }
    ],
    "primaryKey": "id",
    "labelColumn": "code",
    "listColumns": [
      "id",
      "code",
      "description",
      "resource_type",
      "supported_scopes",
      "risk_level",
      "is_delegable"
    ],
    "hasSensitiveColumns": false,
    "foreignKeys": [],
    "uniqueColumns": [
      [
        "code"
      ]
    ]
  },
  {
    "key": "auth.role_permissions",
    "schema": "auth",
    "table": "role_permissions",
    "className": "RolePermission",
    "columns": [
      {
        "name": "frozen",
        "property": "frozen",
        "type": "boolean",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "FALSE",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "role_id",
        "property": "roleId",
        "type": "uuid",
        "nullable": false,
        "primary": true,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "permission_id",
        "property": "permissionId",
        "type": "uuid",
        "nullable": false,
        "primary": true,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "effect",
        "property": "effect",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 5,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "record_scope",
        "property": "recordScope",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 12,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "valid_from",
        "property": "validFrom",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "valid_until",
        "property": "validUntil",
        "type": "timestamptz",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "revoked_at",
        "property": "revokedAt",
        "type": "timestamptz",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "granted_by_user_id",
        "property": "grantedByUserId",
        "type": "uuid",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "change_reason",
        "property": "changeReason",
        "type": "text",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "version",
        "property": "version",
        "type": "integer",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "1",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "created_at",
        "property": "createdAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "updated_at",
        "property": "updatedAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": true,
        "sensitive": false
      }
    ],
    "primaryKey": "role_id",
    "labelColumn": "role_id",
    "listColumns": [
      "role_id",
      "permission_id",
      "effect",
      "record_scope",
      "valid_from",
      "valid_until",
      "revoked_at",
      "granted_by_user_id",
      "change_reason"
    ],
    "hasSensitiveColumns": false,
    "foreignKeys": [
      {
        "target": "roles",
        "schema": "auth",
        "columns": [
          "role_id"
        ],
        "referencedColumns": [
          "id"
        ],
        "onDelete": "CASCADE"
      },
      {
        "target": "permissions",
        "schema": "auth",
        "columns": [
          "permission_id"
        ],
        "referencedColumns": [
          "id"
        ],
        "onDelete": "CASCADE"
      },
      {
        "target": "users",
        "schema": "auth",
        "columns": [
          "granted_by_user_id"
        ],
        "referencedColumns": [
          "id"
        ],
        "onDelete": "SET NULL"
      }
    ],
    "uniqueColumns": []
  },
  {
    "key": "auth.roles",
    "schema": "auth",
    "table": "roles",
    "className": "Role",
    "columns": [
      {
        "name": "frozen",
        "property": "frozen",
        "type": "boolean",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "FALSE",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "id",
        "property": "id",
        "type": "uuid",
        "nullable": false,
        "primary": true,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "gen_random_uuid()",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "code",
        "property": "code",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 64,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "name",
        "property": "name",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 120,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "description",
        "property": "description",
        "type": "text",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "created_at",
        "property": "createdAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "updated_at",
        "property": "updatedAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": true,
        "sensitive": false
      }
    ],
    "primaryKey": "id",
    "labelColumn": "name",
    "listColumns": [
      "id",
      "code",
      "name",
      "description"
    ],
    "hasSensitiveColumns": false,
    "foreignKeys": [],
    "uniqueColumns": [
      [
        "code"
      ]
    ]
  },
  {
    "key": "auth.sessions",
    "schema": "auth",
    "table": "sessions",
    "className": "Session",
    "columns": [
      {
        "name": "frozen",
        "property": "frozen",
        "type": "boolean",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "FALSE",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "updated_at",
        "property": "updatedAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "id",
        "property": "id",
        "type": "uuid",
        "nullable": false,
        "primary": true,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "gen_random_uuid()",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "user_id",
        "property": "userId",
        "type": "uuid",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "token_hash",
        "property": "tokenHash",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 64,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": true
      },
      {
        "name": "ip_address",
        "property": "ipAddress",
        "type": "inet",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "user_agent",
        "property": "userAgent",
        "type": "text",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "created_at",
        "property": "createdAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "expires_at",
        "property": "expiresAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "last_seen_at",
        "property": "lastSeenAt",
        "type": "timestamptz",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "revoked_at",
        "property": "revokedAt",
        "type": "timestamptz",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      }
    ],
    "primaryKey": "id",
    "labelColumn": "id",
    "listColumns": [
      "id",
      "user_id",
      "ip_address",
      "user_agent",
      "expires_at",
      "last_seen_at",
      "revoked_at"
    ],
    "hasSensitiveColumns": true,
    "foreignKeys": [
      {
        "target": "users",
        "schema": "auth",
        "columns": [
          "user_id"
        ],
        "referencedColumns": [
          "id"
        ],
        "onDelete": "CASCADE"
      }
    ],
    "uniqueColumns": [
      [
        "token_hash"
      ]
    ]
  },
  {
    "key": "auth.subject_permissions",
    "schema": "auth",
    "table": "subject_permissions",
    "className": "SubjectPermission",
    "columns": [
      {
        "name": "frozen",
        "property": "frozen",
        "type": "boolean",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "FALSE",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "id",
        "property": "id",
        "type": "uuid",
        "nullable": false,
        "primary": true,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "gen_random_uuid()",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "permission_id",
        "property": "permissionId",
        "type": "uuid",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "subject_type",
        "property": "subjectType",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 8,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "user_id",
        "property": "userId",
        "type": "uuid",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "customer_id",
        "property": "customerId",
        "type": "uuid",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "supplier_id",
        "property": "supplierId",
        "type": "uuid",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "effect",
        "property": "effect",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 5,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "record_scope",
        "property": "recordScope",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 12,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "valid_from",
        "property": "validFrom",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "valid_until",
        "property": "validUntil",
        "type": "timestamptz",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "revoked_at",
        "property": "revokedAt",
        "type": "timestamptz",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "granted_by_user_id",
        "property": "grantedByUserId",
        "type": "uuid",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "revoked_by_user_id",
        "property": "revokedByUserId",
        "type": "uuid",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "change_reason",
        "property": "changeReason",
        "type": "text",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "version",
        "property": "version",
        "type": "integer",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "1",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "created_at",
        "property": "createdAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "updated_at",
        "property": "updatedAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": true,
        "sensitive": false
      }
    ],
    "primaryKey": "id",
    "labelColumn": "id",
    "listColumns": [
      "id",
      "permission_id",
      "subject_type",
      "user_id",
      "customer_id",
      "supplier_id",
      "effect",
      "record_scope",
      "valid_from",
      "valid_until",
      "revoked_at",
      "granted_by_user_id",
      "revoked_by_user_id",
      "change_reason"
    ],
    "hasSensitiveColumns": false,
    "foreignKeys": [
      {
        "target": "permissions",
        "schema": "auth",
        "columns": [
          "permission_id"
        ],
        "referencedColumns": [
          "id"
        ],
        "onDelete": "CASCADE"
      },
      {
        "target": "users",
        "schema": "auth",
        "columns": [
          "user_id"
        ],
        "referencedColumns": [
          "id"
        ],
        "onDelete": "CASCADE"
      },
      {
        "target": "customers",
        "schema": "erp",
        "columns": [
          "customer_id"
        ],
        "referencedColumns": [
          "id"
        ],
        "onDelete": "CASCADE"
      },
      {
        "target": "suppliers",
        "schema": "erp",
        "columns": [
          "supplier_id"
        ],
        "referencedColumns": [
          "id"
        ],
        "onDelete": "CASCADE"
      },
      {
        "target": "users",
        "schema": "auth",
        "columns": [
          "granted_by_user_id"
        ],
        "referencedColumns": [
          "id"
        ],
        "onDelete": "SET NULL"
      },
      {
        "target": "users",
        "schema": "auth",
        "columns": [
          "revoked_by_user_id"
        ],
        "referencedColumns": [
          "id"
        ],
        "onDelete": "SET NULL"
      }
    ],
    "uniqueColumns": []
  },
  {
    "key": "auth.user_roles",
    "schema": "auth",
    "table": "user_roles",
    "className": "UserRole",
    "columns": [
      {
        "name": "frozen",
        "property": "frozen",
        "type": "boolean",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "FALSE",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "updated_at",
        "property": "updatedAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "user_id",
        "property": "userId",
        "type": "uuid",
        "nullable": false,
        "primary": true,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "role_id",
        "property": "roleId",
        "type": "uuid",
        "nullable": false,
        "primary": true,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "granted_by_user_id",
        "property": "grantedByUserId",
        "type": "uuid",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "created_at",
        "property": "createdAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": true,
        "sensitive": false
      }
    ],
    "primaryKey": "user_id",
    "labelColumn": "user_id",
    "listColumns": [
      "user_id",
      "role_id",
      "granted_by_user_id"
    ],
    "hasSensitiveColumns": false,
    "foreignKeys": [
      {
        "target": "users",
        "schema": "auth",
        "columns": [
          "user_id"
        ],
        "referencedColumns": [
          "id"
        ],
        "onDelete": "CASCADE"
      },
      {
        "target": "roles",
        "schema": "auth",
        "columns": [
          "role_id"
        ],
        "referencedColumns": [
          "id"
        ],
        "onDelete": "CASCADE"
      },
      {
        "target": "users",
        "schema": "auth",
        "columns": [
          "granted_by_user_id"
        ],
        "referencedColumns": [
          "id"
        ],
        "onDelete": "SET NULL"
      }
    ],
    "uniqueColumns": []
  },
  {
    "key": "auth.users",
    "schema": "auth",
    "table": "users",
    "className": "User",
    "columns": [
      {
        "name": "frozen",
        "property": "frozen",
        "type": "boolean",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "FALSE",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "id",
        "property": "id",
        "type": "uuid",
        "nullable": false,
        "primary": true,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "gen_random_uuid()",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "email",
        "property": "email",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 320,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "display_name",
        "property": "displayName",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 160,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "phone",
        "property": "phone",
        "type": "varchar",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": 32,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "password_hash",
        "property": "passwordHash",
        "type": "text",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": true
      },
      {
        "name": "status",
        "property": "status",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 16,
        "precision": null,
        "scale": null,
        "default": "'pending'",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "email_verified_at",
        "property": "emailVerifiedAt",
        "type": "timestamptz",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "last_login_at",
        "property": "lastLoginAt",
        "type": "timestamptz",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "created_at",
        "property": "createdAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "updated_at",
        "property": "updatedAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": true,
        "sensitive": false
      }
    ],
    "primaryKey": "id",
    "labelColumn": "display_name",
    "listColumns": [
      "id",
      "email",
      "display_name",
      "phone",
      "status",
      "email_verified_at",
      "last_login_at"
    ],
    "hasSensitiveColumns": true,
    "foreignKeys": [],
    "uniqueColumns": []
  },
  {
    "key": "app.audit_events",
    "schema": "app",
    "table": "audit_events",
    "className": "AuditEvent",
    "columns": [
      {
        "name": "frozen",
        "property": "frozen",
        "type": "boolean",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "FALSE",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "updated_at",
        "property": "updatedAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "id",
        "property": "id",
        "type": "uuid",
        "nullable": false,
        "primary": true,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "gen_random_uuid()",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "source_schema",
        "property": "sourceSchema",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 8,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "actor_user_id",
        "property": "actorUserId",
        "type": "uuid",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "action",
        "property": "action",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 160,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "entity_type",
        "property": "entityType",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 120,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "entity_id",
        "property": "entityId",
        "type": "varchar",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": 255,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "request_id",
        "property": "requestId",
        "type": "varchar",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": 128,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "ip_address",
        "property": "ipAddress",
        "type": "inet",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "metadata",
        "property": "metadata",
        "type": "jsonb",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CAST('{}' AS jsonb)",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "occurred_at",
        "property": "occurredAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "recorded_at",
        "property": "recordedAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": false,
        "sensitive": false
      }
    ],
    "primaryKey": "id",
    "labelColumn": "id",
    "listColumns": [
      "id",
      "source_schema",
      "actor_user_id",
      "action",
      "entity_type",
      "entity_id",
      "request_id",
      "ip_address",
      "metadata",
      "occurred_at",
      "recorded_at"
    ],
    "hasSensitiveColumns": false,
    "foreignKeys": [
      {
        "target": "users",
        "schema": "auth",
        "columns": [
          "actor_user_id"
        ],
        "referencedColumns": [
          "id"
        ],
        "onDelete": "SET NULL"
      }
    ],
    "uniqueColumns": []
  },
  {
    "key": "app.feature_flags",
    "schema": "app",
    "table": "feature_flags",
    "className": "FeatureFlag",
    "columns": [
      {
        "name": "frozen",
        "property": "frozen",
        "type": "boolean",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "FALSE",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "key",
        "property": "key",
        "type": "varchar",
        "nullable": false,
        "primary": true,
        "array": false,
        "length": 120,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "description",
        "property": "description",
        "type": "text",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "enabled",
        "property": "enabled",
        "type": "boolean",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "FALSE",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "configuration",
        "property": "configuration",
        "type": "jsonb",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CAST('{}' AS jsonb)",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "updated_by_user_id",
        "property": "updatedByUserId",
        "type": "uuid",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "created_at",
        "property": "createdAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "updated_at",
        "property": "updatedAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": true,
        "sensitive": false
      }
    ],
    "primaryKey": "key",
    "labelColumn": "key",
    "listColumns": [
      "key",
      "description",
      "enabled",
      "configuration",
      "updated_by_user_id"
    ],
    "hasSensitiveColumns": false,
    "foreignKeys": [
      {
        "target": "users",
        "schema": "auth",
        "columns": [
          "updated_by_user_id"
        ],
        "referencedColumns": [
          "id"
        ],
        "onDelete": "SET NULL"
      }
    ],
    "uniqueColumns": []
  },
  {
    "key": "app.files",
    "schema": "app",
    "table": "files",
    "className": "File",
    "columns": [
      {
        "name": "frozen",
        "property": "frozen",
        "type": "boolean",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "FALSE",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "id",
        "property": "id",
        "type": "uuid",
        "nullable": false,
        "primary": true,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "gen_random_uuid()",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "storage_backend",
        "property": "storageBackend",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 32,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "storage_container",
        "property": "storageContainer",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 160,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "storage_key",
        "property": "storageKey",
        "type": "text",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "original_name",
        "property": "originalName",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 255,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "content_type",
        "property": "contentType",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 160,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "byte_size",
        "property": "byteSize",
        "type": "bigint",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "sha256",
        "property": "sha256",
        "type": "varchar",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": 64,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "status",
        "property": "status",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 16,
        "precision": null,
        "scale": null,
        "default": "'pending'",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "uploaded_by_user_id",
        "property": "uploadedByUserId",
        "type": "uuid",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "metadata",
        "property": "metadata",
        "type": "jsonb",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CAST('{}' AS jsonb)",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "created_at",
        "property": "createdAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "updated_at",
        "property": "updatedAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "deleted_at",
        "property": "deletedAt",
        "type": "timestamptz",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      }
    ],
    "primaryKey": "id",
    "labelColumn": "id",
    "listColumns": [
      "id",
      "storage_backend",
      "storage_container",
      "storage_key",
      "original_name",
      "content_type",
      "byte_size",
      "sha256",
      "status",
      "uploaded_by_user_id",
      "metadata",
      "deleted_at"
    ],
    "hasSensitiveColumns": false,
    "foreignKeys": [
      {
        "target": "users",
        "schema": "auth",
        "columns": [
          "uploaded_by_user_id"
        ],
        "referencedColumns": [
          "id"
        ],
        "onDelete": "SET NULL"
      }
    ],
    "uniqueColumns": [
      [
        "storage_backend",
        "storage_container",
        "storage_key"
      ]
    ]
  },
  {
    "key": "app.notifications",
    "schema": "app",
    "table": "notifications",
    "className": "Notification",
    "columns": [
      {
        "name": "frozen",
        "property": "frozen",
        "type": "boolean",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "FALSE",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "updated_at",
        "property": "updatedAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "id",
        "property": "id",
        "type": "uuid",
        "nullable": false,
        "primary": true,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "gen_random_uuid()",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "auth_user_id",
        "property": "authUserId",
        "type": "uuid",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "kind",
        "property": "kind",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 80,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "title",
        "property": "title",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 240,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "body",
        "property": "body",
        "type": "text",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "payload",
        "property": "payload",
        "type": "jsonb",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CAST('{}' AS jsonb)",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "read_at",
        "property": "readAt",
        "type": "timestamptz",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "archived_at",
        "property": "archivedAt",
        "type": "timestamptz",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "created_at",
        "property": "createdAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": true,
        "sensitive": false
      }
    ],
    "primaryKey": "id",
    "labelColumn": "title",
    "listColumns": [
      "id",
      "auth_user_id",
      "kind",
      "title",
      "body",
      "payload",
      "read_at",
      "archived_at"
    ],
    "hasSensitiveColumns": false,
    "foreignKeys": [
      {
        "target": "users",
        "schema": "auth",
        "columns": [
          "auth_user_id"
        ],
        "referencedColumns": [
          "id"
        ],
        "onDelete": "CASCADE"
      }
    ],
    "uniqueColumns": []
  },
  {
    "key": "app.user_preferences",
    "schema": "app",
    "table": "user_preferences",
    "className": "UserPreference",
    "columns": [
      {
        "name": "frozen",
        "property": "frozen",
        "type": "boolean",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "FALSE",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "auth_user_id",
        "property": "authUserId",
        "type": "uuid",
        "nullable": false,
        "primary": true,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "locale",
        "property": "locale",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 35,
        "precision": null,
        "scale": null,
        "default": "'en'",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "time_zone",
        "property": "timeZone",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 64,
        "precision": null,
        "scale": null,
        "default": "'UTC'",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "theme",
        "property": "theme",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 16,
        "precision": null,
        "scale": null,
        "default": "'system'",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "preferences",
        "property": "preferences",
        "type": "jsonb",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CAST('{}' AS jsonb)",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "created_at",
        "property": "createdAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "updated_at",
        "property": "updatedAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": true,
        "sensitive": false
      }
    ],
    "primaryKey": "auth_user_id",
    "labelColumn": "auth_user_id",
    "listColumns": [
      "auth_user_id",
      "locale",
      "time_zone",
      "theme",
      "preferences"
    ],
    "hasSensitiveColumns": false,
    "foreignKeys": [
      {
        "target": "users",
        "schema": "auth",
        "columns": [
          "auth_user_id"
        ],
        "referencedColumns": [
          "id"
        ],
        "onDelete": "CASCADE"
      }
    ],
    "uniqueColumns": []
  },
  {
    "key": "settings.gsettings",
    "schema": "settings",
    "table": "gsettings",
    "className": "GSettings",
    "columns": [
      {
        "name": "frozen",
        "property": "frozen",
        "type": "boolean",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "FALSE",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "id",
        "property": "id",
        "type": "uuid",
        "nullable": false,
        "primary": true,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "gen_random_uuid()",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "setting_key",
        "property": "settingKey",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 160,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "scope_type",
        "property": "scopeType",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 8,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "role_id",
        "property": "roleId",
        "type": "uuid",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "value",
        "property": "value",
        "type": "jsonb",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "version",
        "property": "version",
        "type": "integer",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "1",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "valid_from",
        "property": "validFrom",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "valid_until",
        "property": "validUntil",
        "type": "timestamptz",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "change_reason",
        "property": "changeReason",
        "type": "text",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "created_by_user_id",
        "property": "createdByUserId",
        "type": "uuid",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "updated_by_user_id",
        "property": "updatedByUserId",
        "type": "uuid",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "created_at",
        "property": "createdAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "updated_at",
        "property": "updatedAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": true,
        "sensitive": false
      }
    ],
    "primaryKey": "id",
    "labelColumn": "id",
    "listColumns": [
      "id",
      "setting_key",
      "scope_type",
      "role_id",
      "value",
      "valid_from",
      "valid_until",
      "change_reason",
      "created_by_user_id",
      "updated_by_user_id"
    ],
    "hasSensitiveColumns": false,
    "foreignKeys": [
      {
        "target": "setting_definitions",
        "schema": "settings",
        "columns": [
          "setting_key"
        ],
        "referencedColumns": [
          "key"
        ],
        "onDelete": "RESTRICT"
      },
      {
        "target": "roles",
        "schema": "auth",
        "columns": [
          "role_id"
        ],
        "referencedColumns": [
          "id"
        ],
        "onDelete": "RESTRICT"
      },
      {
        "target": "users",
        "schema": "auth",
        "columns": [
          "created_by_user_id"
        ],
        "referencedColumns": [
          "id"
        ],
        "onDelete": "SET NULL"
      },
      {
        "target": "users",
        "schema": "auth",
        "columns": [
          "updated_by_user_id"
        ],
        "referencedColumns": [
          "id"
        ],
        "onDelete": "SET NULL"
      }
    ],
    "uniqueColumns": []
  },
  {
    "key": "settings.setting_definitions",
    "schema": "settings",
    "table": "setting_definitions",
    "className": "SettingDefinition",
    "columns": [
      {
        "name": "frozen",
        "property": "frozen",
        "type": "boolean",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "FALSE",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "key",
        "property": "key",
        "type": "varchar",
        "nullable": false,
        "primary": true,
        "array": false,
        "length": 160,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "category",
        "property": "category",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 64,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "description",
        "property": "description",
        "type": "text",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "value_type",
        "property": "valueType",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 16,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "default_value",
        "property": "defaultValue",
        "type": "jsonb",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "allow_null",
        "property": "allowNull",
        "type": "boolean",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "FALSE",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "enum_values",
        "property": "enumValues",
        "type": "jsonb",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "minimum_value",
        "property": "minimumValue",
        "type": "numeric",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "maximum_value",
        "property": "maximumValue",
        "type": "numeric",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "unit",
        "property": "unit",
        "type": "varchar",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": 32,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "validation_rules",
        "property": "validationRules",
        "type": "jsonb",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CAST('{}' AS jsonb)",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "scope_precedence",
        "property": "scopePrecedence",
        "type": "text",
        "nullable": false,
        "primary": false,
        "array": true,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CAST(ARRAY['global'] AS text[])",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "document_kinds",
        "property": "documentKinds",
        "type": "text",
        "nullable": false,
        "primary": false,
        "array": true,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CAST('{}' AS text[])",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "is_overridable",
        "property": "isOverridable",
        "type": "boolean",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "FALSE",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "resolution_strategy",
        "property": "resolutionStrategy",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 20,
        "precision": null,
        "scale": null,
        "default": "'global_only'",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "change_permission_code",
        "property": "changePermissionCode",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 128,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "is_enabled",
        "property": "isEnabled",
        "type": "boolean",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "TRUE",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "version",
        "property": "version",
        "type": "integer",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "1",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "created_by_user_id",
        "property": "createdByUserId",
        "type": "uuid",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "updated_by_user_id",
        "property": "updatedByUserId",
        "type": "uuid",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "created_at",
        "property": "createdAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "updated_at",
        "property": "updatedAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": true,
        "sensitive": false
      }
    ],
    "primaryKey": "key",
    "labelColumn": "key",
    "listColumns": [
      "key",
      "category",
      "description",
      "value_type",
      "default_value",
      "allow_null",
      "enum_values",
      "minimum_value",
      "maximum_value",
      "unit",
      "validation_rules",
      "scope_precedence",
      "document_kinds",
      "is_overridable",
      "resolution_strategy",
      "change_permission_code",
      "is_enabled",
      "created_by_user_id",
      "updated_by_user_id"
    ],
    "hasSensitiveColumns": false,
    "foreignKeys": [
      {
        "target": "permissions",
        "schema": "auth",
        "columns": [
          "change_permission_code"
        ],
        "referencedColumns": [
          "code"
        ],
        "onDelete": "RESTRICT"
      },
      {
        "target": "users",
        "schema": "auth",
        "columns": [
          "created_by_user_id"
        ],
        "referencedColumns": [
          "id"
        ],
        "onDelete": "SET NULL"
      },
      {
        "target": "users",
        "schema": "auth",
        "columns": [
          "updated_by_user_id"
        ],
        "referencedColumns": [
          "id"
        ],
        "onDelete": "SET NULL"
      }
    ],
    "uniqueColumns": []
  },
  {
    "key": "settings.settings",
    "schema": "settings",
    "table": "settings",
    "className": "Setting",
    "columns": [
      {
        "name": "frozen",
        "property": "frozen",
        "type": "boolean",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "FALSE",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "id",
        "property": "id",
        "type": "uuid",
        "nullable": false,
        "primary": true,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "gen_random_uuid()",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "setting_key",
        "property": "settingKey",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 160,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "scope_type",
        "property": "scopeType",
        "type": "varchar",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": 16,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "scope_id",
        "property": "scopeId",
        "type": "uuid",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "value",
        "property": "value",
        "type": "jsonb",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "version",
        "property": "version",
        "type": "integer",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "1",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "valid_from",
        "property": "validFrom",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": false,
        "sensitive": false
      },
      {
        "name": "valid_until",
        "property": "validUntil",
        "type": "timestamptz",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "change_reason",
        "property": "changeReason",
        "type": "text",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "created_by_user_id",
        "property": "createdByUserId",
        "type": "uuid",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "updated_by_user_id",
        "property": "updatedByUserId",
        "type": "uuid",
        "nullable": true,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": null,
        "audit": false,
        "sensitive": false
      },
      {
        "name": "created_at",
        "property": "createdAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": true,
        "sensitive": false
      },
      {
        "name": "updated_at",
        "property": "updatedAt",
        "type": "timestamptz",
        "nullable": false,
        "primary": false,
        "array": false,
        "length": null,
        "precision": null,
        "scale": null,
        "default": "CURRENT_TIMESTAMP",
        "audit": true,
        "sensitive": false
      }
    ],
    "primaryKey": "id",
    "labelColumn": "id",
    "listColumns": [
      "id",
      "setting_key",
      "scope_type",
      "scope_id",
      "value",
      "valid_from",
      "valid_until",
      "change_reason",
      "created_by_user_id",
      "updated_by_user_id"
    ],
    "hasSensitiveColumns": false,
    "foreignKeys": [
      {
        "target": "setting_definitions",
        "schema": "settings",
        "columns": [
          "setting_key"
        ],
        "referencedColumns": [
          "key"
        ],
        "onDelete": "RESTRICT"
      },
      {
        "target": "users",
        "schema": "auth",
        "columns": [
          "created_by_user_id"
        ],
        "referencedColumns": [
          "id"
        ],
        "onDelete": "SET NULL"
      },
      {
        "target": "users",
        "schema": "auth",
        "columns": [
          "updated_by_user_id"
        ],
        "referencedColumns": [
          "id"
        ],
        "onDelete": "SET NULL"
      }
    ],
    "uniqueColumns": [
      [
        "scope_type",
        "scope_id",
        "setting_key"
      ]
    ]
  }
];

/** Lookup by `schema.table`. */
export const entitiesByKey = Object.fromEntries(entities.map((entity) => [entity.key, entity]));

/** Tables of one schema. */
export function entitiesOfSchema(schema) {
  return entities.filter((entity) => entity.schema === schema);
}

/** One entity, or undefined. */
export function entity(key) {
  return entitiesByKey[key];
}

export const generatedAt = "2026-10-16T00:27:09.847Z";
