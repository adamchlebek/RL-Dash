export async function getEdgeConfig<T>(key: string): Promise<{ value: T } | null> {
    try {
        const response = await fetch('/api/edge-config', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ action: 'get', key })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error getting edge config:', error);
        return null;
    }
}

export async function setEdgeConfig<T>(key: string, value: T): Promise<void> {
    const response = await fetch('/api/edge-config', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'set', key, value })
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
}
