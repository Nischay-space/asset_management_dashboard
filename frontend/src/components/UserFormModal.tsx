import { useState, type FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { createUser, updateUser } from '../api/users';
import type { UserFormData } from '../api/users';
import type { UserWithAssets } from '../types/asset';
import Modal from './Modal';
import TextField from './TextField';

interface UserFormModalProps {
  user?: UserWithAssets;
  onClose: () => void;
}

export default function UserFormModal({ user, onClose }: UserFormModalProps) {
  const isEditing = Boolean(user);
  const queryClient = useQueryClient();

  const [form, setForm] = useState<UserFormData>({
    name: user?.name ?? '',
    email: user?.email ?? '',
    role: user?.role ?? 'viewer',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: keyof UserFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isEditing && user) {
        await updateUser(user.id, form);
        toast.success('User updated');
      } else {
        await createUser(form);
        toast.success('User created');
      }
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal onClose={onClose}>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        {isEditing ? 'Edit Person' : 'Add Person'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <TextField label="Name" value={form.name} onChange={(v) => updateField('name', v)} required />
        <TextField label="Email" value={form.email ?? ''} onChange={(v) => updateField('email', v)} />

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
          <select
            value={form.role}
            onChange={(e) => updateField('role', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          >
            <option value="viewer">Viewer</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 mt-4">
          <button type="button" onClick={onClose} className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-3 py-1.5 text-sm rounded-md bg-primary text-white hover:bg-primary-hover disabled:bg-blue-300"
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Person'}
          </button>
        </div>
      </form>
    </Modal>
  );
}