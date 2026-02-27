import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://wbdljhrxfgezfpwmbobe.supabase.co', 'sb_publishable_RQEIbFqllSYkg8ifCt3QPg_6363EbDM');

async function test() {
    const { data: ags } = await supabase.from('ag_agendamentos').select('id, profissional_id, user_id, titulo').limit(10);
    console.log('Agendamentos:', ags);

    const { data: profs } = await supabase.from('ag_profissionais').select('id, profile_id').limit(10);
    console.log('Profissionais:', profs);
}

test();
