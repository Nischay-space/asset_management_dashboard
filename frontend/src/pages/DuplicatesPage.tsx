import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getDuplicateCandidates, dismissPair, mergeUsers } from '../api/duplicates';
import EmptyState from '../components/EmptyState';

export default function DuplicatesPage() {
  const queryClient = useQueryClient();
  const { data: candidates, isLoading } = useQuery({ queryKey: ['duplicates'], queryFn: getDuplicateCandidates });

  const current = candidates?.[0];

  function handleResolved() {
    queryClient.invalidateQueries({ queryKey: ['duplicates'] });
    queryClient.invalidateQueries({ queryKey: ['users'] });
    queryClient.invalidateQueries({ queryKey: ['summary'] });
  }

  async function mergeLeft() {
    if (!current) return;
    try {
      await mergeUsers(current.user_a.id, current.user_b.id);
      toast.success(`Merged into ${current.user_a.name}`);
      handleResolved();
    } catch {
      toast.error('Merge failed');
    }
  }

  async function mergeRight() {
    if (!current) return;
    try {
      await mergeUsers(current.user_b.id, current.user_a.id);
      toast.success(`Merged into ${current.user_b.name}`);
      handleResolved();
    } catch {
      toast.error('Merge failed');
    }
  }

  async function notDuplicate() {
    if (!current) return;
    try {
      await dismissPair(current.user_a.id, current.user_b.id);
      toast.success('Marked as not a duplicate');
      handleResolved();
    } catch {
      toast.error('Failed to dismiss');
    }
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!current) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      const key = e.key.toLowerCase();
      if (key === 'l') mergeLeft();
      if (key === 'r') mergeRight();
      if (key === 'n') notDuplicate();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [current]);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Possible Duplicate People</h1>
        <p className="text-sm text-gray-500">Review name matches that weren't automatically merged during import.</p>
      </div>

      {isLoading && <p className="text-gray-500">Checking...</p>}
      {candidates && candidates.length === 0 && <EmptyState message="No possible duplicates found." />}

      {current && (
        <div className="bg-surface rounded-xl border border-border-subtle shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <span className="text-sm text-gray-600">{current.similarity}% match — {current.reason}</span>
            <span className="text-xs text-gray-400 ml-auto">{candidates?.length} pending</span>
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
            <div className="border border-border-subtle rounded-lg p-4">
              <p className="text-xs text-gray-400 mb-1">Person A</p>
              <p className="font-semibold text-gray-800">{current.user_a.name}</p>
              <p className="text-xs text-gray-400 mb-3">{current.user_a.email}</p>
              <p className="text-sm text-gray-600">{current.user_a.asset_count} asset(s)</p>
            </div>

            <div className="flex flex-col gap-2 w-40">
              <button onClick={mergeLeft} className="flex items-center justify-between text-sm border border-primary text-primary rounded-lg px-3 py-2 hover:bg-primary/5">
                Merge Left <kbd className="text-xs border border-primary/30 rounded px-1">L</kbd>
              </button>
              <button onClick={mergeRight} className="flex items-center justify-between text-sm border border-primary text-primary rounded-lg px-3 py-2 hover:bg-primary/5">
                Merge Right <kbd className="text-xs border border-primary/30 rounded px-1">R</kbd>
              </button>
              <button onClick={notDuplicate} className="flex items-center justify-between text-sm border border-danger text-danger rounded-lg px-3 py-2 hover:bg-red-50">
                Not Duplicate <kbd className="text-xs border border-danger/30 rounded px-1">N</kbd>
              </button>
            </div>

            <div className="border border-border-subtle rounded-lg p-4">
              <p className="text-xs text-gray-400 mb-1">Person B</p>
              <p className="font-semibold text-gray-800">{current.user_b.name}</p>
              <p className="text-xs text-gray-400 mb-3">{current.user_b.email}</p>
              <p className="text-sm text-gray-600">{current.user_b.asset_count} asset(s)</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}