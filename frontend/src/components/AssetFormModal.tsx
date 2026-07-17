import { useState, type FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { createAsset, updateAsset } from '../api/assets';
import type { Asset } from '../types/asset';
import type { AssetFormData } from '../api/assets';
import Modal from './Modal';
import TextField from './TextField';
import UserMultiSelect from './UserMultiSelect';
import { assignUser, unassignUser } from '../api/assets';
import type { User } from '../types/asset';

interface AssetFormModalProps {
    asset?: Asset;
    onClose: () => void;
}


const EMPTY_FORM: AssetFormData = {
    asset_code: '',
    name: '',
    category: '',
    commodity_type: '',
    brand_name: '',
    model_name: '',
    serial_number: '',
    location: '',
    status: '',
};

export default function AssetFormModal({ asset, onClose }: AssetFormModalProps) {
    const isEditing = Boolean(asset);
    const queryClient = useQueryClient();
    const [assignedUsers, setAssignedUsers] = useState<User[]>(asset?.assigned_users ?? []);

    const [form, setForm] = useState<AssetFormData>(
        asset
            ? {
                asset_code: asset.asset_code,
                name: asset.name,
                category: asset.category ?? '',
                commodity_type: asset.commodity_type ?? '',
                brand_name: asset.brand_name ?? '',
                model_name: asset.model_name ?? '',
                serial_number: asset.serial_number ?? '',
                location: asset.location ?? '',
                status: asset.status ?? '',
            }
            : EMPTY_FORM
    );
    const [isSubmitting, setIsSubmitting] = useState(false);

    function updateField(field: keyof AssetFormData, value: string) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            let savedAsset: Asset;

            if (isEditing && asset) {
                const { asset_code, ...updateData } = form;
                savedAsset = await updateAsset(asset.id, updateData);
            } else {
                savedAsset = await createAsset(form);
            }

            const originalIds = new Set((asset?.assigned_users ?? []).map((u) => u.id));
            const currentIds = new Set(assignedUsers.map((u) => u.id));

            const toAdd = assignedUsers.filter((u) => !originalIds.has(u.id));
            const toRemove = (asset?.assigned_users ?? []).filter((u) => !currentIds.has(u.id));

            await Promise.all([
                ...toAdd.map((u) => assignUser(savedAsset.id, u.id)),
                ...toRemove.map((u) => unassignUser(savedAsset.id, u.id)),
            ]);

            toast.success(isEditing ? 'Asset updated' : 'Asset created');
            queryClient.invalidateQueries({ queryKey: ['assets'] });
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['summary'] });
            queryClient.invalidateQueries({ queryKey: ['filter-options'] });
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
                {isEditing ? 'Edit Asset' : 'Add Asset'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">
                <TextField
                    label="Asset Code"
                    value={form.asset_code ?? ''}
                    onChange={(v) => updateField('asset_code', v)}
                    required
                    disabled={isEditing}
                />
                <TextField label="Name" value={form.name} onChange={(v) => updateField('name', v)} required />

                <div className="grid grid-cols-2 gap-3">
                    <TextField label="Category" value={form.category ?? ''} onChange={(v) => updateField('category', v)} />
                    <TextField label="Type" value={form.commodity_type ?? ''} onChange={(v) => updateField('commodity_type', v)} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <TextField label="Brand" value={form.brand_name ?? ''} onChange={(v) => updateField('brand_name', v)} />
                    <TextField label="Model" value={form.model_name ?? ''} onChange={(v) => updateField('model_name', v)} />
                </div>

                <TextField label="Serial Number" value={form.serial_number ?? ''} onChange={(v) => updateField('serial_number', v)} />

                <div className="grid grid-cols-2 gap-3">
                    <TextField label="Location" value={form.location ?? ''} onChange={(v) => updateField('location', v)} />
                    <TextField label="Status" value={form.status ?? ''} onChange={(v) => updateField('status', v)} />
                </div>

                <UserMultiSelect selected={assignedUsers} onChange={setAssignedUsers} />

                <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 mt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-3 py-1.5 text-sm rounded-md bg-primary text-white hover:bg-primary-hover disabled:bg-blue-300"
                    >
                        {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Asset'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}