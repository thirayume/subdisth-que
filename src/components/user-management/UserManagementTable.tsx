
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
  last_sign_in_at: string | null;
}

interface UserManagementTableProps {
  users: User[];
  onUpdateRole: (userId: string, newRole: string) => void;
  onRefresh: () => void;
}

const UserManagementTable: React.FC<UserManagementTableProps> = ({
  users,
  onUpdateRole,
  onRefresh
}) => {
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'staff':
        return 'default';
      case 'patient':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'staff':
        return 'Staff';
      case 'patient':
        return 'Patient';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">System Users</h2>
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {user.full_name || 'No Name'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ID: {user.id.slice(0, 8)}...
                    </div>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {getRoleDisplay(user.role)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => onUpdateRole(user.id, 'admin')}
                        disabled={user.role === 'admin'}
                      >
                        Make Admin
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onUpdateRole(user.id, 'staff')}
                        disabled={user.role === 'staff'}
                      >
                        Make Staff
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onUpdateRole(user.id, 'patient')}
                        disabled={user.role === 'patient'}
                      >
                        Make Patient
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UserManagementTable;
