import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: ags } = await supabase
        .from('ag_view_agendamentos_completo')
        .select('id, data, hora_inicio, profissional_id, profile_id, cliente_nome, titulo')
        .eq('data', '2026-02-27');

    console.log('JSON OUTPUT:');
    console.log(JSON.stringify(ags, null, 2));
}

check();
