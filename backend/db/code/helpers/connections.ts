/**
 * Connection helpers.
 *
 * One client per call, always closed. TLS comes from the URL query keys the
 * shared policy permits, so credentials and certificates are never converted
 * into loggable configuration objects.
 */
import { readFileSync } from 'node:fs';
import type { Client, ClientConfig } from 'pg';
import pg from 'pg';
import { parseMaintenanceUrl } from '../config.js';
import { parseDatabaseUrl } from '../connection-policy.js';

const { Client: PgClient } = pg;

/** Which policy validates the URL before a client is created. */
export type ConnectionTarget = 'application' | 'maintenance';

export interface ConnectOptions {
  applicationName?: string | undefined;
  connectTimeoutMs?: number | undefined;
  statementTimeoutMs?: number | undefined;
  /** 'application' enforces the shared hanouti-only policy; 'maintenance' allows a maintenance database. */
  target?: ConnectionTarget | undefined;
}

/** Build a driver configuration from a validated URL, without logging it. */
export function clientConfigFromUrl(url: string, options: ConnectOptions = {}): ClientConfig {
  const parsed =
    options.target === 'maintenance'
      ? parseMaintenanceUrl(url)
      : parseDatabaseUrl(url, 'libpq');
  const config: ClientConfig = {
    connectionString: url,
    application_name: options.applicationName ?? 'hanouti-db',
  };

  const timeout = options.connectTimeoutMs;
  if (timeout !== undefined) config.connectionTimeoutMillis = timeout;
  const statementTimeout = options.statementTimeoutMs;
  if (statementTimeout !== undefined) config.statement_timeout = statementTimeout;

  const ssl = sslFromUrl(parsed);
  if (ssl !== undefined) config.ssl = ssl;

  return config;
}

/**
 * Map the permitted TLS query keys onto driver options. `require` keeps the
 * libpq meaning — encrypt, do not verify the chain — while `verify-ca` and
 * `verify-full` verify, using sslrootcert when it is supplied.
 */
function sslFromUrl(url: URL): ClientConfig['ssl'] | undefined {
  const mode = url.searchParams.get('sslmode');
  const rootCert = url.searchParams.get('sslrootcert');
  const clientCert = url.searchParams.get('sslcert');
  const clientKey = url.searchParams.get('sslkey');

  if (mode === null && rootCert === null && clientCert === null && clientKey === null)
    return undefined;
  if (mode === 'disable') return false;

  const verifying = mode === 'verify-ca' || mode === 'verify-full';
  const ssl: NonNullable<ClientConfig['ssl']> = {
    rejectUnauthorized: verifying,
  };
  if (verifying && rootCert !== null) ssl.ca = readFileSync(rootCert, 'utf8');
  if (clientCert !== null) ssl.cert = readFileSync(clientCert, 'utf8');
  if (clientKey !== null) ssl.key = readFileSync(clientKey, 'utf8');
  return ssl;
}

/** Open a client, run the callback and always close it. */
export async function withClient<T>(
  url: string,
  run: (client: Client) => Promise<T>,
  options: ConnectOptions = {},
): Promise<T> {
  const client = new PgClient(clientConfigFromUrl(url, options));
  try {
    await client.connect();
    return await run(client);
  } finally {
    await client.end().catch(() => undefined);
  }
}

export { PgClient };
