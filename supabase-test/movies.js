export async function getMovies(supabase) {
  const { data, error } = await supabase.from('movie_list').select('*')
  if (error) throw error
  return data
}

export async function addMovie(supabase, title) {
  const { data, error } = await supabase
    .from('movie_list')
    .insert({ title })
    .select()
    .single()
  if (error) throw error
  return data
}