import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://aodavqqraktiviwptjso.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_YtIocxBAdhN65m2d-SSfIQ_HVZihp6B';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
