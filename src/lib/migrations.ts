
import { openDB } from 'idb';
import { toast } from '@/lib/toast';

interface Migration {
  version: number;
  description: string;
  migrate: (db: IDBPDatabase) => Promise<void>;
}

const migrations: Migration[] = [
  {
    version: 1,
    description: 'Initial database setup',
    migrate: async (db) => {
      // This is handled by the upgrade function in initDB
      console.log('Migration 1 completed: Initial database setup');
    }
  },
  // Future migrations will be added here
  // Example:
  // {
  //   version: 2,
  //   description: 'Add new field to transactions',
  //   migrate: async (db) => {
  //     // Migration logic here
  //   }
  // }
];

export async function runMigrations(dbName: string, currentVersion: number) {
  try {
    console.log(`Running migrations for ${dbName}, current version: ${currentVersion}`);
    
    const pendingMigrations = migrations.filter(m => m.version > currentVersion);
    
    if (pendingMigrations.length === 0) {
      console.log('No pending migrations');
      return currentVersion;
    }
    
    // Sort migrations by version
    pendingMigrations.sort((a, b) => a.version - b.version);
    
    // Apply migrations in order
    for (const migration of pendingMigrations) {
      console.log(`Applying migration ${migration.version}: ${migration.description}`);
      
      // Open the database with the new version
      const db = await openDB(dbName, migration.version, {
        upgrade: (db, oldVersion, newVersion, transaction) => {
          // Skip migrations that have already been applied
          if (oldVersion >= migration.version) return;
          
          console.log(`Upgrading from version ${oldVersion} to ${migration.version}`);
        }
      });
      
      // Run the migration
      await migration.migrate(db);
      console.log(`Migration ${migration.version} completed successfully`);
      
      // Close the database connection
      db.close();
    }
    
    const newVersion = pendingMigrations[pendingMigrations.length - 1].version;
    console.log(`All migrations completed. New database version: ${newVersion}`);
    return newVersion;
  } catch (error) {
    console.error('Migration failed:', error);
    toast.error('Falha na migração do banco de dados');
    throw error;
  }
}

export function getCurrentMigrationVersion(): number {
  return migrations[migrations.length - 1].version;
}

export function registerMigration(migration: Migration) {
  migrations.push(migration);
  // Sort migrations by version to ensure they run in order
  migrations.sort((a, b) => a.version - b.version);
}
