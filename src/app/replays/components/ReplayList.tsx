'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Clock, RefreshCw, AlarmClock } from 'lucide-react';
import type { Replay } from '@prisma/client';
import { useReplaySubscription } from '@/lib/useReplaySubscription';

interface Props {
    replays: Replay[];
    isLoading: boolean;
    onReprocess: (replayId: string, ballchasingId: string) => Promise<void>;
    onRefresh: () => Promise<void>;
}

export function ReplayList({
    replays,
    isLoading,
    onReprocess,
    onRefresh
}: Props): React.ReactElement {
    const [page, setPage] = useState<number>(1);
    const [isProcessing, setIsProcessing] = useState<{ [key: string]: boolean }>({});
    const itemsPerPage = 10;

    // Subscribe to replay updates
    useReplaySubscription(onRefresh);

    const getStatusIcon = (status: string): React.ReactElement => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'failed':
                return <XCircle className="h-5 w-5 text-red-500" />;
            case 'processing':
                return <Clock className="h-5 w-5 text-yellow-500" />;
            case 'reprocessing':
                return <AlarmClock className="h-5 w-5 text-purple-500" />;
            default:
                return <Clock className="h-5 w-5 text-gray-500" />;
        }
    };

    const handleReprocess = async (replayId: string, ballchasingId: string): Promise<void> => {
        setIsProcessing((prev) => ({ ...prev, [replayId]: true }));
        await onReprocess(replayId, ballchasingId);
        setIsProcessing((prev) => ({ ...prev, [replayId]: false }));
    };

    const paginatedReplays = replays.slice((page - 1) * itemsPerPage, page * itemsPerPage);
    const totalPages = Math.ceil(replays.length / itemsPerPage);

    if (isLoading) {
        return (
            <div className="flex justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="mb-4 flex items-center justify-between">
                <div className="text-sm text-zinc-400">
                    {replays.length} {replays.length === 1 ? 'replay' : 'replays'} total
                </div>
                <button
                    onClick={() => onRefresh()}
                    className="flex cursor-pointer items-center rounded-md bg-zinc-800 px-3 py-1 text-sm text-white transition-colors hover:bg-zinc-700"
                >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                </button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-zinc-800">
                <table className="min-w-full divide-y divide-zinc-800">
                    <thead className="bg-zinc-900">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-zinc-400 uppercase">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-zinc-400 uppercase">
                                File Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-zinc-400 uppercase">
                                Upload Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-zinc-400 uppercase">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-700 bg-zinc-800">
                        {paginatedReplays.map((replay) => (
                            <tr key={replay.id} className="transition-colors hover:bg-zinc-700">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        {getStatusIcon(replay.status)}
                                        <span className="ml-2 text-xs text-zinc-500 uppercase">
                                            {replay.status}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-zinc-300">{replay.fileName}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-zinc-400">
                                        {new Date(replay.uploadedAt).toLocaleString()}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {replay.status === 'completed' && (
                                        <button
                                            onClick={() =>
                                                handleReprocess(replay.id, replay.ballchasingId)
                                            }
                                            disabled={isProcessing[replay.id]}
                                            className="flex cursor-pointer items-center rounded-md bg-purple-600 px-3 py-1 text-sm text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <RefreshCw
                                                className={`h-4 w-4 ${isProcessing[replay.id] ? 'animate-spin' : ''}`}
                                            />
                                            <span className="ml-2">Reprocess</span>
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center space-x-2">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="cursor-pointer rounded-md bg-zinc-800 px-3 py-1 text-sm text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="px-3 py-1 text-sm text-zinc-400">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="cursor-pointer rounded-md bg-zinc-800 px-3 py-1 text-sm text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
