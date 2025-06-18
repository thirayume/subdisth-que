
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import UserManagementHeader from './UserManagementHeader';
import UserManagementTable from './UserManagementTable';
import CreateUserDialog from './CreateUserDialog';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'staff' | 'patient';
  created_at: string;
  last_sign_in_at: string | null;
}

const UserManagementContainer: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          role,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map the data to include last_sign_in_at as null since it's not available in profiles
      const mappedUsers: User[] = (data || []).map(user => ({
        ...user,
        last_sign_in_at: null,
        role: user.role as 'admin' | 'staff' | 'patient'
      }));
      
      setUsers(mappedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'admin' | 'staff' | 'patient') => {
    try {
      // Update profile role
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (profileError) throw profileError;

      // Delete existing role
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      // Insert new role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: newRole });

      if (roleError) throw roleError;

      toast.success('User role updated successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <UserManagementHeader 
        onCreateUser={() => setShowCreateDialog(true)}
        totalUsers={users.length}
        adminUsers={users.filter(u => u.role === 'admin').length}
        staffUsers={users.filter(u => u.role === 'staff').length}
      />
      
      <UserManagementTable 
        users={users}
        onUpdateRole={updateUserRole}
        onRefresh={fetchUsers}
      />

      <CreateUserDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onUserCreated={fetchUsers}
      />
    </div>
  );
};

export default UserManagementContainer;
