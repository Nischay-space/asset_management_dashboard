import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { getUsers } from '../api/users';
import Chip from './Chip';
import type { User } from '../types/asset';

interface UserMultiSelectProps {
    selected: User[];
    onChange: (users: User[]) => void;
}

export default function UserMultiSelect({ selected, onChange }: UserMultiSelectProps) {
    const [query, setQuery] = useState('');
    const { data: allUsers } = useQuery({ queryKey: ['users'], queryFn: getUsers });

    const selectedIds = new Set(selected.map((u) => u.id));

    const suggestions = (allUsers ?? [])
        .filter((u) => !selectedIds.has(u.id))
        .filter((u) => query.length > 0 && u.name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 6);

    function addUser(user: User) {
        onChange([...selected, user]);
        setQuery('');
    }

    function removeUser(userId: number) {
        onChange(selected.filter((u) => u.id !== userId));
    }

    return (
        <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Assigned To</label>

            <div className="flex flex-wrap gap-1.5 mb-2">
                {selected.map((user) => (
                    <Chip key={user.id} outlined>
                        {user.name}
                        <button onClick={() => removeUser(user.id)} className="ml-1.5">
                            <X className="w-3 h-3 inline" />
                        </button>
                    </Chip>
                ))}
            </div>

            <div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search people to assign..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
                {suggestions.length > 0 && (
                    <div className="mt-1 border border-gray-200 rounded-lg divide-y divide-gray-100">
                        {suggestions.map((user) => (
                            <button 
                                key={user.id}
                                type="button"
                                onClick={() => addUser(user)}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex justify-between items-center"
                            >
                                <span>{user.name}</span>
                                <span className="text-xs text-gray-400">{user.email ?? 'no email'}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}