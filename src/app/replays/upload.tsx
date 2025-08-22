'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { ArrowUpCircle, CheckCircle, XCircle, AlertCircle, Upload, Clock, Trash2 } from 'lucide-react';
import { getEdgeConfig } from '@/lib/edgeConfig';

interface FileProgress {
    file: File;
    status: 'queued' | 'checking' | 'uploading' | 'success' | 'error' | 'duplicate' | 'invalid';
    error?: string;
    ballchasingId?: string;
    storageUrl?: string;
}

interface Props {
    onUploadComplete: () => Promise<void>;
}

export default function ReplayUpload({ onUploadComplete }: Props): React.ReactElement {
    const [uploading, setUploading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [fileProgress, setFileProgress] = useState<FileProgress[]>([]);
    const [uploadStats, setUploadStats] = useState({
        total: 0,
        completed: 0,
        successful: 0,
        failed: 0,
        duplicates: 0,
        invalid: 0
    });

    const checkMatchType = async (file: File): Promise<boolean> => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/parse/basic', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to check match type');
            }

            const data = await response.json();
            console.log('Match type check response:', data);

            return data.match_type === 'Private';
        } catch (err) {
            console.error('Error checking match type:', err);
            // Default to true (allow upload) if parsing fails
            return true;
        }
    };

    const updateStats = useCallback((files: FileProgress[]) => {
        const stats = files.reduce((acc, file) => {
            acc.total = files.length;
            if (['success', 'error', 'duplicate', 'invalid'].includes(file.status)) {
                acc.completed++;
            }
            if (file.status === 'success') acc.successful++;
            if (file.status === 'error') acc.failed++;
            if (file.status === 'duplicate') acc.duplicates++;
            if (file.status === 'invalid') acc.invalid++;
            return acc;
        }, { total: 0, completed: 0, successful: 0, failed: 0, duplicates: 0, invalid: 0 });
        
        setUploadStats(stats);
    }, []);

    const updateFileStatus = useCallback((fileIndex: number, status: FileProgress['status'], error?: string, ballchasingId?: string, storageUrl?: string) => {
        setFileProgress(prev => {
            const updated = prev.map((item, index) => 
                index === fileIndex 
                    ? { ...item, status, error, ballchasingId, storageUrl }
                    : item
            );
            updateStats(updated);
            return updated;
        });
    }, [updateStats]);

    const processFileUpload = useCallback(async (file: File, fileIndex: number, shouldCheckPrivateMatches: boolean): Promise<void> => {
        try {
            // Update to checking status
            updateFileStatus(fileIndex, 'checking');
            
            if (shouldCheckPrivateMatches) {
                const isPrivate = await checkMatchType(file);
                if (!isPrivate) {
                    updateFileStatus(fileIndex, 'invalid', 'Not a private match');
                    return;
                }
            }

            // Update to uploading status
            updateFileStatus(fileIndex, 'uploading');

            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/replays', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                updateFileStatus(fileIndex, 'error', errorData.message || 'Upload failed');
                return;
            }

            const replay = await response.json();

            if (replay.isDuplicate) {
                updateFileStatus(fileIndex, 'duplicate', 'Already processed', replay.ballchasingId, replay.storageUrl);
            } else {
                updateFileStatus(fileIndex, 'success', undefined, replay.ballchasingId, replay.storageUrl);
            }
        } catch (err) {
            updateFileStatus(fileIndex, 'error', err instanceof Error ? err.message : 'Upload failed');
        }
    }, [updateFileStatus]);

    const processBatch = useCallback(async (files: { file: File; index: number }[], shouldCheckPrivateMatches: boolean): Promise<void> => {
        const promises = files.map(({ file, index }) => 
            processFileUpload(file, index, shouldCheckPrivateMatches)
        );
        await Promise.allSettled(promises);
    }, [processFileUpload]);

    const onDrop = useCallback(
        async (acceptedFiles: File[]) => {
            if (acceptedFiles.length === 0) return;

            setUploading(true);
            setError(null);

            // Initialize file progress tracking
            const initialProgress: FileProgress[] = acceptedFiles.map(file => ({
                file,
                status: 'queued'
            }));
            setFileProgress(initialProgress);
            updateStats(initialProgress);

            try {
                const checkPrivateMatches = await getEdgeConfig('check_private_matches');
                const shouldCheckPrivateMatches = (checkPrivateMatches?.value as boolean) ?? true;

                // Process files in parallel batches to avoid overwhelming the server
                const BATCH_SIZE = 3; // Adjust this value to control concurrency
                const fileIndexPairs = acceptedFiles.map((file, index) => ({ file, index }));
                
                for (let i = 0; i < fileIndexPairs.length; i += BATCH_SIZE) {
                    const batch = fileIndexPairs.slice(i, i + BATCH_SIZE);
                    await processBatch(batch, shouldCheckPrivateMatches);
                }

                await onUploadComplete();
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to upload replays');
            } finally {
                setUploading(false);
            }
        },
        [onUploadComplete, processBatch, updateStats]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/octet-stream': ['.replay']
        },
        disabled: uploading
    });

    return (
        <div className="w-full">
            <div
                {...getRootProps()}
                className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                    isDragActive
                        ? 'border-purple-500 bg-purple-900/20'
                        : 'border-zinc-700 hover:border-zinc-500'
                }`}
            >
                <input {...getInputProps()} />
                <ArrowUpCircle className="mx-auto mb-3 h-12 w-12 text-zinc-500" />
                <p className="mb-2 text-base">
                    {isDragActive
                        ? 'Drop the replay files here'
                        : 'Drag & drop replay files here, or click to select'}
                </p>
                <p className="text-xs text-zinc-500">Upload as many .replay files at once</p>
                
                {uploading && (
                    <div className="mt-4 space-y-3">
                        {/* Overall Progress */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span>Progress: {uploadStats.completed}/{uploadStats.total}</span>
                                <span>{uploadStats.total > 0 ? Math.round((uploadStats.completed / uploadStats.total) * 100) : 0}%</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-zinc-800">
                                <div 
                                    className="h-2 rounded-full bg-purple-500 transition-all duration-300" 
                                    style={{ width: `${uploadStats.total > 0 ? (uploadStats.completed / uploadStats.total) * 100 : 0}%` }}
                                />
                            </div>
                            
                            {/* Stats Summary */}
                            <div className="flex gap-4 text-xs justify-center">
                                {uploadStats.successful > 0 && <span className="text-green-400">✓ {uploadStats.successful}</span>}
                                {uploadStats.failed > 0 && <span className="text-red-400">✗ {uploadStats.failed}</span>}
                                {uploadStats.duplicates > 0 && <span className="text-yellow-400">⚠ {uploadStats.duplicates}</span>}
                                {uploadStats.invalid > 0 && <span className="text-orange-400">⚡ {uploadStats.invalid}</span>}
                            </div>
                        </div>
                    </div>
                )}

                {error && <p className="mt-4 text-xs text-red-500 whitespace-pre-line">{error}</p>}
            </div>

            {/* File Progress List */}
            {fileProgress.length > 0 && (
                <div className="mt-6 space-y-2 max-h-96 overflow-y-auto">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-zinc-300">File Upload Progress</h3>
                        {!uploading && (
                            <button
                                onClick={() => {
                                    setFileProgress([]);
                                    setUploadStats({ total: 0, completed: 0, successful: 0, failed: 0, duplicates: 0, invalid: 0 });
                                }}
                                className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1"
                            >
                                <Trash2 className="w-3 h-3" />
                                Clear
                            </button>
                        )}
                    </div>
                    {fileProgress.map((item, index) => (
                        <div 
                            key={index} 
                            className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800"
                        >
                            {/* Status Icon */}
                            <div className="flex-shrink-0">
                                {item.status === 'queued' && <Clock className="w-4 h-4 text-zinc-500" />}
                                {item.status === 'checking' && <AlertCircle className="w-4 h-4 text-blue-400 animate-pulse" />}
                                {item.status === 'uploading' && <Upload className="w-4 h-4 text-purple-400 animate-pulse" />}
                                {item.status === 'success' && <CheckCircle className="w-4 h-4 text-green-400" />}
                                {item.status === 'duplicate' && <AlertCircle className="w-4 h-4 text-yellow-400" />}
                                {item.status === 'invalid' && <XCircle className="w-4 h-4 text-orange-400" />}
                                {item.status === 'error' && <XCircle className="w-4 h-4 text-red-400" />}
                            </div>

                            {/* File Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-zinc-200 truncate">
                                        {item.file.name}
                                    </span>
                                    <span className="text-xs text-zinc-500">
                                        ({(item.file.size / 1024 / 1024).toFixed(1)}MB)
                                    </span>
                                </div>
                                
                                {/* Status Text */}
                                <div className="text-xs mt-1">
                                    {item.status === 'queued' && <span className="text-zinc-500">Waiting...</span>}
                                    {item.status === 'checking' && <span className="text-blue-400">Checking match type...</span>}
                                    {item.status === 'uploading' && <span className="text-purple-400">Uploading...</span>}
                                    {item.status === 'success' && (
                                        <span className="text-green-400">
                                            Successfully uploaded {item.ballchasingId && `(${item.ballchasingId.slice(0, 8)}...)`}
                                        </span>
                                    )}
                                    {item.status === 'duplicate' && (
                                        <span className="text-yellow-400">
                                            Already processed {item.ballchasingId && `(${item.ballchasingId.slice(0, 8)}...)`}
                                        </span>
                                    )}
                                    {item.status === 'invalid' && <span className="text-orange-400">{item.error}</span>}
                                    {item.status === 'error' && <span className="text-red-400">{item.error}</span>}
                                </div>
                            </div>

                            {/* Action Links */}
                            {(item.status === 'success' || item.status === 'duplicate') && item.storageUrl && (
                                <a 
                                    href={item.storageUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-purple-400 hover:text-purple-300 flex-shrink-0"
                                >
                                    View File
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
