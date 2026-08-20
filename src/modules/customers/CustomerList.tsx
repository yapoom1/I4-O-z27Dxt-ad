import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Button, Input, Select, Dialog } from '@/shared/ui/Primitives';
import { Users, Search, AlertCircle, UserX, Plus } from 'lucide-react';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_TENANT_USERS } from '@/shared/graphql/queries/customers';
import { CREATE_USER } from '@/shared/graphql/mutations/customers';

export const CustomerList: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobilenumber, setMobilenumber] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER');
  const [validationError, setValidationError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { data, loading, error, refetch } = useQuery<any>(GET_TENANT_USERS, {
    errorPolicy: 'all',
  });

  const [createUser, { loading: creating, error: createError }] = useMutation(CREATE_USER);

  const roleOptions = [
    { label: 'User', value: 'USER' },
    { label: 'Tenant Admin', value: 'TENANT_ADMIN' },
    { label: 'Super Admin', value: 'SUPER_ADMIN' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    setValidationError('');
    setSuccessMessage('');

    if (!name.trim()) {
      setValidationError('Name is required.');
      return;
    }
    if (!mobilenumber.trim()) {
      setValidationError('Mobile number is required.');
      return;
    }

    try {
      const input: any = {
        name: name.trim(),
        mobilenumber: mobilenumber.trim(),
        role,
      };

      if (email.trim()) {
        input.email = email.trim();
      }
      if (password) {
        input.password = password;
      }

      await createUser({
        variables: { input },
      });

      setSuccessMessage('User created successfully!');
      
      await refetch();

      // Clear the form fields
      setName('');
      setEmail('');
      setMobilenumber('');
      setPassword('');
      setRole('USER');

      setTimeout(() => {
        setIsCreateModalOpen(false);
        setSuccessMessage('');
      }, 1000);
    } catch (err) {
      console.error('Error creating user:', err);
    }
  };

  const rawUsers = data?.tenantUsers ?? [];

  const users = useMemo(() => {
    const list = rawUsers.map((u: any) => ({
      id: u.id,
      name: u.name || '—',
      email: u.email || '—',
      mobile: u.mobilenumber || '—',
      role: u.role || '—',
      tenantId: u.tenantId || '—',
    }));

    if (!search.trim()) return list;
    const s = search.toLowerCase();
    return list.filter(
      (u: any) =>
        u.name.toLowerCase().includes(s) ||
        u.email.toLowerCase().includes(s) ||
        u.mobile.includes(s)
    );
  }, [rawUsers, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground m-0">Customers Hub</h1>
          <p className="text-xs text-muted-foreground">
            {loading
              ? 'Loading customers...'
              : error
              ? 'Could not load customers.'
              : (
                  <>
                    <span className="font-semibold text-primary">{rawUsers.length.toLocaleString()}</span> customers synced from backend.
                    {data?.totalUsers !== undefined && (
                      <span className="ml-1 text-muted-foreground">
                        (Total users in system: <span className="font-semibold">{data.totalUsers.toLocaleString()}</span>)
                      </span>
                    )}
                  </>
                )
            }
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setIsCreateModalOpen(true)} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Create User
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              className="w-full h-9 pl-9 pr-4 rounded-md border border-input bg-card text-xs focus:outline-none focus:ring-1 focus:ring-ring"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="flex flex-col max-h-[580px] overflow-hidden">
        {/* Table Head */}
        <div className="border-b border-border bg-card/80 sticky top-0 z-10 shrink-0">
          <div className="flex items-center text-xs font-semibold text-muted-foreground border-b border-border select-none uppercase tracking-wider py-3 px-4">
            <div style={{ width: '200px' }}>Name</div>
            <div style={{ width: '240px' }}>Email</div>
            <div style={{ width: '160px' }}>Mobile</div>
            <div style={{ width: '120px' }}>Role</div>
            <div style={{ flex: 1 }}>ID</div>
            <div style={{ width: '100px', textAlign: 'right' }}>Actions</div>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto min-h-[300px] max-h-[520px] divide-y divide-border bg-card">
          {loading && (
            <div className="py-12 text-center text-xs text-muted-foreground">
              <Users className="h-6 w-6 mx-auto mb-2 opacity-40" />
              Loading customers...
            </div>
          )}

          {error && !loading && (
            <div className="py-12 text-center text-xs text-muted-foreground">
              <AlertCircle className="h-6 w-6 mx-auto mb-2 text-destructive/60" />
              <span className="font-semibold text-foreground block mb-1">Failed to load customers</span>
              {(error as any).graphQLErrors?.[0]?.message || error.message}
            </div>
          )}

          {!loading && !error && users.length === 0 && (
            <div className="py-12 text-center text-xs text-muted-foreground">
              <UserX className="h-6 w-6 mx-auto mb-2 opacity-40" />
              {search.trim() ? 'No customers match your search.' : 'No customers found for this tenant.'}
            </div>
          )}

          {!loading && !error && users.map((user: any) => (
            <div
              key={user.id}
              className="flex items-center text-xs py-3 px-4 hover:bg-muted/10 transition-colors"
            >
              {/* Name + avatar */}
              <div style={{ width: '200px' }} className="flex items-center gap-2 pr-4">
                <div className="h-7 w-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                  {user.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <span className="font-medium text-foreground truncate">{user.name}</span>
              </div>

              {/* Email */}
              <div style={{ width: '240px' }} className="text-muted-foreground truncate pr-4">
                {user.email}
              </div>

              {/* Mobile */}
              <div style={{ width: '160px' }} className="text-muted-foreground pr-4">
                {user.mobile}
              </div>

              {/* Role */}
              <div style={{ width: '120px' }}>
                <span className="inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full border bg-secondary text-secondary-foreground border-border uppercase">
                  {user.role}
                </span>
              </div>

              {/* ID */}
              <div style={{ flex: 1 }} className="font-mono text-[10px] text-muted-foreground truncate pr-4">
                {user.id}
              </div>

              {/* Actions */}
              <div style={{ width: '100px', textAlign: 'right' }}>
                <Button variant="outline" size="sm" onClick={() => navigate(`/customers/${user.id}`, { state: { customerName: user.name } })} className="h-7 text-[10px] px-2 cursor-pointer">
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Create User Modal */}
      <Dialog
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setValidationError('');
          setSuccessMessage('');
        }}
        title="Create New User"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsCreateModalOpen(false);
                setValidationError('');
                setSuccessMessage('');
              }}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              disabled={creating}
            >
              {creating ? 'Creating...' : 'Create User'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {validationError && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {createError && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{(createError as any).graphQLErrors?.[0]?.message || createError.message}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
              {successMessage}
            </div>
          )}

          <div className="space-y-3">
            <Input
              label="Name *"
              placeholder="Enter name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={creating}
              required
            />

            <Input
              label="Mobile Number *"
              placeholder="Enter mobile number"
              value={mobilenumber}
              onChange={(e) => setMobilenumber(e.target.value)}
              disabled={creating}
              required
            />

            <Input
              label="Email"
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={creating}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={creating}
            />

            <Select
              label="Role *"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              options={roleOptions}
              disabled={creating}
            />
          </div>
        </form>
      </Dialog>
    </div>
  );
};
