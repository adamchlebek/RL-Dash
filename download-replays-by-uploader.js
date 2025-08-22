const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_KEY = 'JHg1QkL1qLrA4gCJiMrZSRPlGAVp65ZyAuikBJIi';
const BASE_URL = 'https://ballchasing.com/api';
const UPLOADER_ID = '76561198345380160';
const DOWNLOAD_DIR = './replays';

if (!API_KEY) {
    console.error('BALLCHASING_API_KEY environment variable is required');
    process.exit(1);
}

const headers = {
    'Authorization': API_KEY
};

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchAllReplays() {
    const allReplays = [];
    let nextUrl = `${BASE_URL}/replays?uploader=${UPLOADER_ID}&playlist=private&replay-date-after=2025-01-01T00:00:00Z&count=200`;
    
    console.log('Fetching replays...');
    
    while (nextUrl) {
        try {
            console.log(`Fetching: ${nextUrl}`);
            const response = await axios.get(nextUrl, { headers });
            
            const data = response.data;
            allReplays.push(...data.list);
            
            console.log(`Fetched ${data.list.length} replays. Total so far: ${allReplays.length}`);
            
            nextUrl = data.next;
            
            // Rate limiting: 4 calls/second for Diamond patrons
            if (nextUrl) {
                await sleep(250);
            }
        } catch (error) {
            console.error('Error fetching replays:', error.response?.data || error.message);
            break;
        }
    }
    
    console.log(`Total replays found: ${allReplays.length}`);
    return allReplays;
}

async function downloadReplayFile(replayId, filename) {
    try {
        const url = `${BASE_URL}/replays/${replayId}/file`;
        console.log(`Downloading ${filename}...`);
        
        const response = await axios.get(url, {
            headers,
            responseType: 'stream'
        });
        
        const filePath = path.join(DOWNLOAD_DIR, filename);
        const writer = fs.createWriteStream(filePath);
        
        response.data.pipe(writer);
        
        return new Promise((resolve, reject) => {
            writer.on('finish', () => {
                console.log(`Downloaded: ${filename}`);
                resolve();
            });
            writer.on('error', reject);
        });
    } catch (error) {
        console.error(`Failed to download ${filename}:`, error.response?.data || error.message);
        throw error;
    }
}

async function cleanupOldReplays(validReplayIds) {
    if (!fs.existsSync(DOWNLOAD_DIR)) {
        return;
    }
    
    const files = fs.readdirSync(DOWNLOAD_DIR);
    const replayFiles = files.filter(file => file.endsWith('.replay'));
    
    console.log(`Found ${replayFiles.length} existing replay files in directory`);
    
    const validIds = new Set(validReplayIds);
    let deletedCount = 0;
    
    for (const file of replayFiles) {
        const replayId = file.replace('.replay', '');
        if (!validIds.has(replayId)) {
            const filePath = path.join(DOWNLOAD_DIR, file);
            fs.unlinkSync(filePath);
            console.log(`Deleted old file: ${file}`);
            deletedCount++;
        }
    }
    
    if (deletedCount > 0) {
        console.log(`Cleaned up ${deletedCount} old replay files`);
    } else {
        console.log('No old files to clean up');
    }
}

async function downloadAllReplays(replays) {
    // Create download directory
    if (!fs.existsSync(DOWNLOAD_DIR)) {
        fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
    }
    
    console.log(`Starting download of ${replays.length} replay files...`);
    
    for (let i = 0; i < replays.length; i++) {
        const replay = replays[i];
        const filename = `${replay.id}.replay`;
        const filePath = path.join(DOWNLOAD_DIR, filename);
        
        // Skip if file already exists
        if (fs.existsSync(filePath)) {
            console.log(`Skipping ${filename} (already exists)`);
            continue;
        }
        
        try {
            await downloadReplayFile(replay.id, filename);
            
            // Rate limiting for download: 4 calls/second for Diamond patrons
            if (i < replays.length - 1) {
                await sleep(250);
            }
        } catch (error) {
            console.error(`Failed to download replay ${replay.id}, continuing...`);
            continue;
        }
    }
    
    console.log('Download complete!');
}

async function main() {
    try {
        const replays = await fetchAllReplays();
        
        if (replays.length === 0) {
            console.log('No replays found for this uploader after Jan 1, 2025.');
            return;
        }
        
        // Clean up old replay files that aren't in the current API response
        const validReplayIds = replays.map(replay => replay.id);
        await cleanupOldReplays(validReplayIds);
        
        await downloadAllReplays(replays);
        
        console.log(`\nSummary:`);
        console.log(`- Total replays found (after Jan 1, 2025): ${replays.length}`);
        console.log(`- Downloaded to: ${DOWNLOAD_DIR}`);
        
    } catch (error) {
        console.error('Script failed:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { fetchAllReplays, downloadAllReplays, cleanupOldReplays };
