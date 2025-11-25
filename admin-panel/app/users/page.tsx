'use client';

import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { usersService, User, CreateUserData, CreateUserResponse, CreateAdminData, CreateAdminResponse } from '@/lib/services/users.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Toast } from '@/components/ui/Toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit, Search, Copy, Check } from 'lucide-react';

const createUserSchema = z.object({
  userId: z.string().min(1, 'ID Number is required'),
  name: z.string().min(1, 'Name is required'),
  userType: z.enum(['student', 'professor', 'universityEmployee', 'staff']),
});

const createAdminSchema = z.object({
  userId: z.string().min(1, 'ID Number is required'),
  name: z.string().min(1, 'Name is required'),
  password: z.string().optional(),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;
type CreateAdminFormData = z.infer<typeof createAdminSchema>;

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string>('');
  const [newUserData, setNewUserData] = useState<{ userId: string; name: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState<string>('all');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      userType: 'student',
    },
  });

  const {
    register: registerAdmin,
    handleSubmit: handleSubmitAdmin,
    formState: { errors: adminErrors, isSubmitting: isSubmittingAdmin },
    reset: resetAdmin,
  } = useForm<CreateAdminFormData>({
    resolver: zodResolver(createAdminSchema),
  });

  useEffect(() => {
    fetchUsers();
  }, [userTypeFilter]);

  useEffect(() => {
    if (editingUser) {
      reset({
        userId: editingUser.userId,
        name: editingUser.name,
        userType: editingUser.userType,
      });
    } else {
      reset({
        userId: '',
        name: '',
        userType: 'student',
      });
    }
  }, [editingUser, reset]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (userTypeFilter !== 'all') {
        params.userType = userTypeFilter;
      }
      const response = await usersService.getUsers(params);
      if (response.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setToast({ message: 'Failed to fetch users', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: CreateUserFormData) => {
    try {
      if (editingUser) {
        // Update user (password reset handled separately)
        await usersService.updateUser(editingUser.userId, { name: data.name });
        setToast({ message: 'User updated successfully', type: 'success' });
        setIsModalOpen(false);
        setEditingUser(null);
        reset();
        fetchUsers();
      } else {
        // Create user
        const response = await usersService.createUser(data);
        if (response.success && response.data) {
          setGeneratedPassword(response.data.generatedPassword);
          setNewUserData({
            userId: response.data.userId,
            name: response.data.name,
          });
          setIsModalOpen(false);
          setIsPasswordModalOpen(true);
          reset();
          fetchUsers();
        }
      }
    } catch (error: any) {
      setToast({
        message: error.response?.data?.error?.message || 'Operation failed',
        type: 'error',
      });
    }
  };

  const onCreateAdmin = async (data: CreateAdminFormData) => {
    try {
      const response = await usersService.createAdmin(data);
      if (response.success && response.data) {
        if (response.data.generatedPassword) {
          setGeneratedPassword(response.data.generatedPassword);
          setNewUserData({
            userId: response.data.userId,
            name: response.data.name,
          });
          setIsAdminModalOpen(false);
          setIsPasswordModalOpen(true);
        } else {
          setToast({ message: 'Admin created successfully', type: 'success' });
          setIsAdminModalOpen(false);
        }
        resetAdmin();
        fetchUsers();
      }
    } catch (error: any) {
      setToast({
        message: error.response?.data?.error?.message || 'Failed to create admin',
        type: 'error',
      });
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleToggleActive = async (user: User) => {
    try {
      await usersService.updateUser(user.userId, { isActive: !user.isActive });
      setToast({
        message: `User ${!user.isActive ? 'activated' : 'deactivated'} successfully`,
        type: 'success',
      });
      fetchUsers();
    } catch (error: any) {
      setToast({
        message: error.response?.data?.error?.message || 'Operation failed',
        type: 'error',
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getUserTypeLabel = (user: User) => {
    // If user is admin, show "Admin"
    if (user.role === 'admin') {
      return 'Admin';
    }
    // Otherwise show userType label
    const labels: Record<string, string> = {
      student: 'Student',
      professor: 'Professor',
      universityEmployee: 'University Employee',
      staff: 'Staff',
    };
    return labels[user.userType || ''] || user.userType || '-';
  };

  const getUserTypeColor = (user: User) => {
    // If user is admin, use special admin color
    if (user.role === 'admin') {
      return 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200';
    }
    // Otherwise use userType colors
    const colors: Record<string, string> = {
      student: 'bg-blue-100 text-blue-800',
      professor: 'bg-purple-100 text-purple-800',
      universityEmployee: 'bg-green-100 text-green-800',
      staff: 'bg-orange-100 text-orange-800',
    };
    return colors[user.userType || ''] || 'bg-gray-100 text-gray-800';
  };

  const filteredUsers = users.filter((user) =>
    user.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Manage Users
          </h1>
          <div className="flex gap-4">
            <Button
              onClick={() => {
                setEditingUser(null);
                setIsAdminModalOpen(true);
              }}
              variant="outline"
              className="group relative overflow-hidden bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 hover:border-red-400 text-red-700 hover:text-red-800 hover:from-red-100 hover:to-pink-100 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Plus size={20} className="relative z-10 group-hover:rotate-90 transition-transform duration-300" />
              <span className="relative z-10 font-bold">Create Admin</span>
            </Button>
            <Button
              onClick={() => {
                setEditingUser(null);
                setIsModalOpen(true);
              }}
              variant="primary"
              className="group relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-600 to-blue-700 hover:from-blue-700 hover:via-blue-700 hover:to-blue-800 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Plus size={20} className="relative z-10 group-hover:rotate-90 transition-transform duration-300" />
              <span className="relative z-10 font-bold">Create User</span>
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl border border-gray-100 p-6 mb-6 transition-all duration-300">
          <div className="flex flex-wrap items-end gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  type="text"
                  placeholder="Search by ID or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
            </div>

            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Type</label>
              <select
                value={userTypeFilter}
                onChange={(e) => setUserTypeFilter(e.target.value)}
                className="w-full px-3 py-2 h-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="all">All Types</option>
                <option value="student">Student</option>
                <option value="professor">Professor</option>
                <option value="universityEmployee">University Employee</option>
                <option value="staff">Staff</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    ID Number
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    User Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredUsers.map((user) => (
                  <tr key={user.userId} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all duration-200 hover:shadow-sm">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.userId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${getUserTypeColor(user)}`}>
                        {getUserTypeLabel(user)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          user.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleToggleActive(user)}
                          className={`${
                            user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                          }`}
                          title={user.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div className="text-center py-12 text-gray-500">No users found</div>
            )}
          </div>
        )}

        {/* Create/Edit User Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingUser(null);
            reset();
          }}
          title={editingUser ? 'Edit User' : 'Create New User'}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="ID Number"
              {...register('userId')}
              error={errors.userId?.message}
              disabled={!!editingUser}
              placeholder="e.g., STU001, PROF123, EMP456"
            />

            <Input
              label="Name"
              {...register('name')}
              error={errors.name?.message}
              placeholder="Full name"
            />

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">User Type</label>
              <select
                {...register('userType')}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={!!editingUser}
              >
                <option value="student">Student</option>
                <option value="professor">Professor</option>
                <option value="universityEmployee">University Employee</option>
                <option value="staff">Staff</option>
              </select>
              {errors.userType && (
                <p className="mt-1.5 text-sm font-medium text-red-600 flex items-center gap-1">
                  <span>⚠️</span>
                  {errors.userType.message}
                </p>
              )}
            </div>

            {editingUser && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-4 shadow-sm">
                <p className="text-sm font-medium text-yellow-800 flex items-center gap-2">
                  <span className="text-lg">ℹ️</span>
                  Note: To reset password, use the password reset feature (coming soon).
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                className="flex-1"
              >
                {editingUser ? 'Update User' : 'Create User'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingUser(null);
                  reset();
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal>

        {/* Create/Edit Admin Modal */}
        <Modal
          isOpen={isAdminModalOpen}
          onClose={() => {
            setIsAdminModalOpen(false);
            resetAdmin();
          }}
          title="Create New Admin"
        >
          <form onSubmit={handleSubmitAdmin(onCreateAdmin)} className="space-y-5">
            <Input
              label="Admin ID"
              {...registerAdmin('userId')}
              error={adminErrors.userId?.message}
              placeholder="e.g., admin2, superadmin"
            />

            <Input
              label="Admin Name"
              {...registerAdmin('name')}
              error={adminErrors.name?.message}
              placeholder="Full name"
            />

            <Input
              label="Password (Optional)"
              type="password"
              {...registerAdmin('password')}
              error={adminErrors.password?.message}
              placeholder="Leave blank to auto-generate"
              showPasswordToggle={true}
            />

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 shadow-sm">
              <p className="text-sm font-medium text-blue-800 flex items-start gap-2">
                <span className="text-lg">💡</span>
                <span>If no password is provided, a secure password will be auto-generated and shown after creation.</span>
              </p>
            </div>

            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmittingAdmin}
                className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
              >
                Create Admin
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAdminModalOpen(false);
                  resetAdmin();
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal>

        {/* Generated Password Modal */}
        <Modal
          isOpen={isPasswordModalOpen}
          onClose={() => {
            setIsPasswordModalOpen(false);
            setGeneratedPassword('');
            setNewUserData(null);
          }}
          title="User Created Successfully"
          size="md"
        >
          <div className="space-y-5">
            <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 border-2 border-green-300 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-green-500 rounded-full p-2">
                  <Check size={20} className="text-white" />
                </div>
                <p className="text-lg font-bold text-green-800">Credentials Generated Successfully!</p>
              </div>
              <div className="space-y-4 bg-white/50 rounded-xl p-4 backdrop-blur-sm">
                <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">ID Number</span>
                  <p className="text-xl font-mono font-bold text-gray-900 mt-1">{newUserData?.userId}</p>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</span>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{newUserData?.name}</p>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Password</span>
                  <div className="flex items-center gap-2">
                    <p className="text-xl font-mono font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex-1 px-3 py-2 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      {generatedPassword}
                    </p>
                    <button
                      onClick={() => copyToClipboard(generatedPassword)}
                      className="p-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 hover:scale-110 transform shadow-md hover:shadow-lg"
                      title="Copy password"
                    >
                      {copied ? <Check size={20} /> : <Copy size={20} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-4 shadow-sm">
              <p className="text-sm font-medium text-yellow-800 flex items-start gap-2">
                <span className="text-xl">⚠️</span>
                <span><strong>Important:</strong> Share these credentials with the user. The password will not be shown again.</span>
              </p>
            </div>

            <Button
              variant="primary"
              onClick={() => {
                setIsPasswordModalOpen(false);
                setGeneratedPassword('');
                setNewUserData(null);
              }}
              className="w-full"
            >
              Close
            </Button>
          </div>
        </Modal>

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </Layout>
  );
}
