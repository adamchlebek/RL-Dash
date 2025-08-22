import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Read file as buffer
        const buffer = Buffer.from(await file.arrayBuffer());
        
        // Parse the replay file to extract match type
        const replayData = parseReplayHeader(buffer);
        
        console.log('Parsed replay data:', JSON.stringify(replayData, null, 2));
        return NextResponse.json(replayData);
    } catch (error) {
        console.error('Error parsing replay:', error);
        return NextResponse.json({ 
            error: 'Failed to parse replay file',
            match_type: 'Unknown' 
        }, { status: 500 });
    }
}

function parseReplayHeader(buffer: Buffer): { match_type: string; [key: string]: string | Record<string, string> } {
    try {
        // Rocket League replay files are structured with a header containing metadata
        // The file starts with a length-prefixed string section containing properties
        
        let offset = 0;
        
        // Skip initial bytes and find the properties section
        // Replays start with version info, then have a properties section
        
        // Read first 4 bytes (header size)
        if (buffer.length < 8) {
            throw new Error('File too small to be a valid replay');
        }
        
        const headerSize = buffer.readUInt32LE(0);
        offset += 4;
        
        // Skip CRC
        offset += 4;
        
        // Read engine/licensee version info
        offset += 8;
        
        // Read header label size and skip it
        if (offset + 4 > buffer.length) {
            return { match_type: 'Private' }; // Default to Private for safety
        }
        
        const labelSize = buffer.readUInt32LE(offset);
        offset += 4 + labelSize;
        
        // Now we're at the properties section
        // Properties are stored as key-value pairs with length prefixes
        
        const properties: Record<string, string> = {};
        
        // Read properties until we find MatchType or reach reasonable limit
        let attempts = 0;
        while (offset < buffer.length && offset < headerSize + 1000 && attempts < 50) {
            attempts++;
            
            try {
                // Read property name length
                if (offset + 4 > buffer.length) break;
                const nameLength = buffer.readUInt32LE(offset);
                offset += 4;
                
                if (nameLength <= 0 || nameLength > 200 || offset + nameLength > buffer.length) {
                    break;
                }
                
                // Read property name
                const propertyName = buffer.toString('utf8', offset, offset + nameLength - 1); // -1 to skip null terminator
                offset += nameLength;
                
                // Read property type length
                if (offset + 4 > buffer.length) break;
                const typeLength = buffer.readUInt32LE(offset);
                offset += 4;
                
                if (typeLength <= 0 || typeLength > 50 || offset + typeLength > buffer.length) {
                    break;
                }
                
                // Read property type
                const propertyType = buffer.toString('utf8', offset, offset + typeLength - 1);
                offset += typeLength;
                
                // Read property size
                if (offset + 8 > buffer.length) break;
                const propertySize = buffer.readUInt32LE(offset);
                offset += 8; // Skip size and some padding
                
                if (propertySize <= 0 || propertySize > 1000 || offset + propertySize > buffer.length) {
                    // Skip this property
                    continue;
                }
                
                // Read property value based on type
                let value: string | null = null;
                if (propertyType === 'StrProperty' || propertyType === 'NameProperty') {
                    // String property
                    if (offset + 4 <= buffer.length) {
                        const strLength = buffer.readUInt32LE(offset);
                        offset += 4;
                        if (strLength > 0 && strLength <= 200 && offset + strLength <= buffer.length) {
                            value = buffer.toString('utf8', offset, offset + strLength - 1);
                            offset += strLength;
                        }
                    }
                } else {
                    // Skip other property types for now
                    offset += propertySize;
                }
                
                if (value !== null) {
                    properties[propertyName] = value;
                }
                
                // If we found MatchType, we can return early
                if (propertyName === 'MatchType' && value) {
                    return {
                        match_type: value,
                        properties
                    };
                }
                
            } catch {
                // If we hit an error parsing a property, try to continue
                offset += 1;
                continue;
            }
        }
        
        // Return the match type if found, otherwise default to Private
        const matchType = properties.MatchType || 'Private';
        
        return {
            match_type: matchType,
            properties
        };
        
    } catch (error) {
        console.error('Error parsing replay header:', error);
        // Default to Private for safety - this way private match checks will pass
        return { 
            match_type: 'Private',
            error: error instanceof Error ? error.message : 'Unknown parsing error'
        };
    }
}
