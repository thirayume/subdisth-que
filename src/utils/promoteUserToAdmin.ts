
import { supabase } from '@/integrations/supabase/client';

export const promoteUserToAdmin = async (email: string) => {
  try {
    // Update profile role
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('email', email);

    if (profileError) throw profileError;

    // Get user ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (!profile) throw new Error('User not found');

    // Delete existing role
    await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', profile.id);

    // Insert admin role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({ user_id: profile.id, role: 'admin' });

    if (roleError) throw roleError;

    console.log(`Successfully promoted ${email} to admin`);
    return true;
  } catch (error) {
    console.error('Error promoting user to admin:', error);
    return false;
  }
};
