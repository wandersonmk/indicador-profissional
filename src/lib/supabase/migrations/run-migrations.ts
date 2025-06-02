import 'dotenv/config';
import { supabase } from '../supabase';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  try {
    // Lista de arquivos de migração em ordem
    const migrations = [
      '00_create_exec_sql_function.sql',
      '01_create_professional_profiles.sql',
      '02_create_pending_approvals.sql',
      '03_create_field_configurations.sql',
      '04_create_professional_profile_trigger.sql'
    ];

    for (const migration of migrations) {
      console.log(`Executando migração: ${migration}`);
      
      const filePath = path.join(__dirname, migration);
      const sql = fs.readFileSync(filePath, 'utf8');

      const { error } = await supabase.rpc('exec_sql', { sql });

      if (error) {
        console.error(`Erro ao executar migração ${migration}:`, error);
        throw error;
      }

      console.log(`Migração ${migration} executada com sucesso!`);
    }

    console.log('Todas as migrações foram executadas com sucesso!');
  } catch (error) {
    console.error('Erro ao executar migrações:', error);
    process.exit(1);
  }
}

runMigrations(); 