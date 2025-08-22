'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { ArrowUpCircle } from 'lucide-react';
import { getEdgeConfig } from '@/lib/edgeConfig';

interface Props {
    onUploadComplete: () => Promise<void>;
}

export default function ReplayUpload({ onUploadComplete }: Props): React.ReactElement {
    const [uploading, setUploading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

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

    const onDrop = useCallback(
        async (acceptedFiles: File[]) => {
            if (acceptedFiles.length === 0) return;

            setUploading(true);
            setError(null);

            const duplicates: string[] = [];
            const invalidMatches: string[] = [];

            try {
                const checkPrivateMatches = await getEdgeConfig('check_private_matches');
                console.log('Edge config response:', checkPrivateMatches);
                const shouldCheckPrivateMatches = checkPrivateMatches?.value ?? true;
                console.log('Should check private matches:', shouldCheckPrivateMatches);

                for (const file of acceptedFiles) {
                    if (shouldCheckPrivateMatches) {
                        const isPrivate = await checkMatchType(file);
                        if (!isPrivate) {
                            console.log('File rejected as not private:', file.name);
                            invalidMatches.push(file.name);
                            continue;
                        }
                    }

                    const formData = new FormData();
                    formData.append('file', file);

                    try {
                        const response = await fetch('/api/replays', {
                            method: 'POST',
                            body: formData
                        });

                        if (!response.ok) {
                            const errorData = await response.json();
                            console.error(`Failed to upload ${file.name}:`, errorData.message);
                            continue;
                        }

                        const replay = await response.json();

                        if (replay.isDuplicate) {
                            duplicates.push(file.name);
                        }
                    } catch (err) {
                        console.error(`Error uploading ${file.name}:`, err);
                    }
                }

                if (duplicates.length > 0) {
                    const pluralText = duplicates.length === 1 ? 'file has' : 'files have';
                    setError(
                        `${duplicates.length} ${pluralText} already been processed: ${duplicates.join(', ')}`
                    );
                }

                if (invalidMatches.length > 0) {
                    const pluralText = invalidMatches.length === 1 ? 'file is' : 'files are';
                    console.log('Invalid matches detected:', invalidMatches);
                    setError(
                        (prev) =>
                            `${prev ? prev + '\n' : ''}${invalidMatches.length} ${pluralText} not a private match: ${invalidMatches.join(', ')}`
                    );
                }

                await onUploadComplete();
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to upload replays');
            } finally {
                setUploading(false);
            }
        },
        [onUploadComplete]
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
                    <div className="mt-4">
                        <div className="h-2 w-full rounded-full bg-zinc-800">
                            <div className="h-2 w-full animate-pulse rounded-full bg-purple-500"></div>
                        </div>
                        <p className="mt-2 text-xs text-zinc-500">Uploading...</p>
                    </div>
                )}
                {error && <p className="mt-4 text-xs text-red-500">{error}</p>}
            </div>
        </div>
    );
}
