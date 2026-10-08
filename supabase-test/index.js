import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
    {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
)

const { data, error } = await supabase.from('movie_list').select('*')
console.log({ data, error })