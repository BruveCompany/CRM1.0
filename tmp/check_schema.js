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
    const { data: profiles } = await supabase.from('ag_profiles').select('*').limit(1);
    console.log('ag_profiles cols:', Object.keys(profiles[0] || {}).join(', '));

    const { data: statuses } = await supabase.from('ag_lead_statuses').select('*').limit(1);
    console.log('ag_lead_statuses cols:', Object.keys(statuses[0] || {}).join(', '));

    const { data: profs } = await supabase.from('ag_profissionais').select('*').limit(1);
    console.log('ag_profissionais cols:', Object.keys(profs[0] || {}).join(', '));
}

check();
