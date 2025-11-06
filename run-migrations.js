#!/usr/bin/env node

/**
 * Database Migration Runner for IdeaHub
 *
 * This script runs all SQL migrations in order using the Supabase client.
 * It reads migration files from the supabase/migrations directory and
 * executes them using the service role key.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './backend/.env' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✓ ${message}`, colors.green);
}

function logError(message) {
  log(`✗ ${message}`, colors.red);
}

function logInfo(message) {
  log(`ℹ ${message}`, colors.blue);
}

function logWarning(message) {
  log(`⚠ ${message}`, colors.yellow);
}

async function runMigrations() {
  log('\n╔════════════════════════════════════════════╗', colors.cyan);
  log('║     IdeaHub Database Migration Runner     ║', colors.cyan);
  log('╚════════════════════════════════════════════╝\n', colors.cyan);

  // Check environment variables
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    logError('Missing Supabase credentials in backend/.env');
    logInfo('Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
    process.exit(1);
  }

  logInfo(`Connecting to: ${supabaseUrl}`);

  // Create Supabase client with service role
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // Get migration files
  const migrationsDir = join(__dirname, 'supabase', 'migrations');
  let migrationFiles;

  try {
    migrationFiles = readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Ensures migrations run in order (001, 002, etc.)
  } catch (error) {
    logError(`Could not read migrations directory: ${migrationsDir}`);
    logError(error.message);
    process.exit(1);
  }

  if (migrationFiles.length === 0) {
    logWarning('No migration files found!');
    process.exit(1);
  }

  logInfo(`Found ${migrationFiles.length} migration files\n`);

  // Track results
  const results = {
    successful: [],
    failed: [],
  };

  // Run each migration
  for (const file of migrationFiles) {
    const migrationPath = join(migrationsDir, file);
    log(`\n${colors.bold}Running migration: ${file}${colors.reset}`);

    try {
      // Read migration file
      const sql = readFileSync(migrationPath, 'utf8');

      // Execute SQL
      const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql }).catch(async () => {
        // If exec_sql function doesn't exist, try direct query
        // Note: This is a workaround as Supabase doesn't expose a direct SQL execution endpoint
        // We'll need to execute via the REST API directly
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/query`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({ query: sql })
        });

        if (!response.ok) {
          // Try alternative: use pg_query if available
          throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }

        return { data: await response.json(), error: null };
      });

      if (error) {
        throw error;
      }

      logSuccess(`Completed: ${file}`);
      results.successful.push(file);

    } catch (error) {
      logError(`Failed: ${file}`);
      logError(`Error: ${error.message}`);
      results.failed.push({ file, error: error.message });

      // Ask if we should continue
      logWarning('\nMigration failed. Some migrations use features that require direct database access.');
      logInfo('Please use the Supabase Dashboard SQL Editor to run migrations manually.');
      break;
    }
  }

  // Print summary
  log('\n' + '═'.repeat(50), colors.cyan);
  log('MIGRATION SUMMARY', colors.bold + colors.cyan);
  log('═'.repeat(50) + '\n', colors.cyan);

  logSuccess(`Successful: ${results.successful.length} migrations`);
  results.successful.forEach(file => log(`  ✓ ${file}`, colors.green));

  if (results.failed.length > 0) {
    log('');
    logError(`Failed: ${results.failed.length} migrations`);
    results.failed.forEach(({ file, error }) => {
      log(`  ✗ ${file}`, colors.red);
      log(`    ${error}`, colors.red);
    });
  }

  log('\n' + '═'.repeat(50) + '\n', colors.cyan);

  if (results.failed.length > 0) {
    logWarning('Some migrations failed. Please run them manually in Supabase Dashboard.');
    logInfo('\nManual migration steps:');
    logInfo('1. Go to your Supabase Dashboard');
    logInfo('2. Click on "SQL Editor" in the left sidebar');
    logInfo('3. Click "New Query"');
    logInfo('4. Copy the contents of each migration file from supabase/migrations/');
    logInfo('5. Paste and run each migration in order (001, 002, etc.)');
    process.exit(1);
  } else {
    logSuccess('All migrations completed successfully! 🎉');
    logInfo('\nNext steps:');
    logInfo('• Check the Table Editor in Supabase Dashboard to verify tables');
    logInfo('• Test the API endpoints');
    logInfo('• Start building your frontend components\n');
  }
}

// Run migrations
runMigrations().catch(error => {
  logError('\nUnexpected error:');
  logError(error.message);
  console.error(error);
  process.exit(1);
});
