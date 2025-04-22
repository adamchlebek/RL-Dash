'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface TeamSizeFilterProps {
    className?: string;
}

export function TeamSizeFilter({ className }: TeamSizeFilterProps): React.ReactElement {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [selectedTeamSize, setSelectedTeamSize] = useState<string>('all');

    useEffect(() => {
        const teamSize = searchParams.get('teamSize');
        if (teamSize) {
            setSelectedTeamSize(teamSize);
        }
    }, [searchParams]);

    const handleTeamSizeChange = (value: string): void => {
        const params = new URLSearchParams(searchParams.toString());
        if (value === 'all') {
            params.delete('teamSize');
        } else {
            params.set('teamSize', value);
        }
        router.push(`/?${params.toString()}`);
        setSelectedTeamSize(value);
    };

    return (
        <Select value={selectedTeamSize} onValueChange={handleTeamSizeChange}>
            <SelectTrigger className={className}>
                <SelectValue placeholder="Filter by team size" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Games</SelectItem>
                <SelectItem value="2">2s Games</SelectItem>
                <SelectItem value="3">3s Games</SelectItem>
            </SelectContent>
        </Select>
    );
} 