import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getDuplicateCandidates, dismissPair, mergeUsers } from '../api/duplicates';
import type { DuplicateCandidate, DuplicateUserRef } from '../api/duplicates';
import Navbar from '../components/Navbar';
import EmptyState from '../components/EmptyState';

function CandidateCard({ candidate, onResolved }: { candidate: DuplicateCandidate; onResolved: () => void }) {
    async function handleMerge(keep: DuplicateUserRef, remove: DuplicateUserRef) {
        try {
            await mergeUsers(keep.id, remove.id);
            toast.success(`Merged ${remove.name} into ${keep.name}`);
            onResolved();
        } catch {
            toast.error('Merge failed');
        }
    }

    async function handleDismiss() {
        try {
            await dismissPair(candidate.user_a.id, candidate.user_b.id);
            toast.success('Marked as not a duplicate');
            onResolved();
        } catch {
            toast.error('Failed to dismiss');
        }
    }

    return (
        <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-warning" />
                <span className="text-sm text-gray-600">{candidate.similarity}% match — {candidate.reason}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
                {[candidate.user_a, candidate.user_b].map((user) => (
                    <div key={user.id} className="border border-gray-200 rounded-lg p-3">
                        <p className="font-medium text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                        <p className="text-xs text-gray-500 mt-1">{user.asset_count} asset(s)</p>
                    </div>
                ))}
            </div>

            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => handleMerge(candidate.user_a, candidate.user_b)}
                    className="text-sm bg-primary text-white rounded-md px-3 py-1.5 hover:bg-primary-hover"
                >
                    Keep "{candidate.user_a.name}", merge other in
                </button>
                <button
                    onClick={() => handleMerge(candidate.user_b, candidate.user_a)}
                    className="text-sm bg-primary text-white rounded-md px-3 py-1.5 hover:bg-primary-hover"
                >
                    Keep "{candidate.user_b.name}", merge other in
                </button>
                <button
                    onClick={handleDismiss}
                    className="text-sm text-gray-500 hover:bg-gray-100 rounded-md px-3 py-1.5"
                >
                    Not a duplicate
                </button>
            </div>
        </div>
    );
}

export default function DuplicatesPage() {
    const queryClient = useQueryClient();

    const { data: candidates, isLoading } = useQuery({
        queryKey: ['duplicates'],
        queryFn: getDuplicateCandidates,
    });

    function handleResolved() {
        queryClient.invalidateQueries({ queryKey: ['duplicates'] });
        queryClient.invalidateQueries({ queryKey: ['users'] });
        queryClient.invalidateQueries({ queryKey: ['summary'] });
    }

    return (
        <div className="min-h-screen bg-app-bg">
            <Navbar />
            <div className="p-6 max-w-3xl mx-auto space-y-4">
                <h1 className="text-xl font-bold text-gray-800">Possible Duplicate People</h1>
                <p className="text-sm text-gray-500">
                    Review name matches that weren't automatically merged during import.
                </p>

                {isLoading && <p className="text-gray-500">Checking...</p>}
                {candidates && candidates.length === 0 && <EmptyState message="No possible duplicates found." />}
                {candidates?.map((c) => (
                    <CandidateCard key={`${c.user_a.id}-${c.user_b.id}`} candidate={c} onResolved={handleResolved} />
                ))}
            </div>
        </div>
    );
}