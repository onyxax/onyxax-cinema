import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const signUp = async (email: string, password: string, displayName: string, avatarUrl?: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
        avatar_url: avatarUrl || `https://ui-avatars.com/api/?name=${displayName}&background=random&color=fff`,
      },
    },
  });

  if (!error && data.user) {
    // Non-blocking insert — NEVER store passwords, only display metadata
    supabase.from('user_profiles').upsert({
      id: data.user.id,
      email: email,
      display_name: displayName,
      avatar_url: avatarUrl || `https://ui-avatars.com/api/?name=${displayName}&background=random&color=fff`
    }).then();
  }

  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({ email, password });
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};

export const updateProfile = async (id: string, email: string, displayName: string, avatarUrl: string) => {
  const updateData: any = { display_name: displayName, avatar_url: avatarUrl };

  // Persist to Auth Metadata (Safe)
  await supabase.auth.updateUser({
    data: updateData
  });

  // Persist to user_profiles table (Include required email)
  return await supabase.from('user_profiles').upsert({
    id,
    email,
    display_name: displayName,
    avatar_url: avatarUrl
  });
};
