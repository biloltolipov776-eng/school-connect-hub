import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function test() {
  const { data, error } = await supabase.functions.invoke('ai-orchestrator', {
    body: {
      files: { python: 'print("hello")' },
      command: "Task: write a loop. If code solves task, start explanation with VALID. If not, start with INVALID and a hint."
    }
  });
  console.log(data, error);
}

test();
