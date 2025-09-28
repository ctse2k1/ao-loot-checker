// Processing logic for AO Loot Checker (separated for testing)

export function parseLootLoggerContent(content) {
    const lines = content.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
        throw new Error('Loot Logger file is empty');
    }

    // Validate header
    const header = lines[0];
    const expectedHeader = 'timestamp_utc;looted_by__alliance;looted_by__guild;looted_by__name;item_id;item_name;quantity;looted_from__alliance;looted_from__guild;looted_from__name';
    
    if (header !== expectedHeader) {
        throw new Error('Invalid Loot Logger file format');
    }

    // Parse data rows
    const data = [];
    for (let i = 1; i < lines.length; i++) {
        const fields = lines[i].split(';');
        if (fields.length === 10) {
            data.push({
                timestamp_utc: fields[0],
                looted_by__alliance: fields[1],
                looted_by__guild: fields[2],
                looted_by__name: fields[3],
                item_id: fields[4],
                item_name: fields[5],
                quantity: parseInt(fields[6], 10),
                looted_from__alliance: fields[7],
                looted_from__guild: fields[8],
                looted_from__name: fields[9]
            });
        }
    }

    return data;
}

export function parseCheckLogContent(content) {
    const lines = content.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
        throw new Error('Check Log file is empty');
    }

    // Validate header
    const header = lines[0];
    const expectedHeader = '"Date"\t"Player"\t"Item"\t"Enchantment"\t"Quality"\t"Amount"';
    
    if (header !== expectedHeader) {
        throw new Error('Invalid Check Log file format');
    }

    // Parse data rows
    const data = [];
    for (let i = 1; i < lines.length; i++) {
        // Remove quotes and split by tab
        const unquotedLine = lines[i].replace(/"/g, '');
        const fields = unquotedLine.split('\t');
        
        if (fields.length === 6) {
            data.push({
                Date: fields[0],
                Player: fields[1],
                Item: fields[2],
                Enchantment: fields[3],
                Quality: fields[4],
                Amount: parseInt(fields[5], 10)
            });
        }
    }

    return data;
}

export function mergeLootLoggerFiles(filesData) {
    // Simple merge - concatenate all data
    return filesData.flat();
}

export function matchAndReduceQuantities(lootLoggerData, checkLogData) {
    // Create a map for efficient lookup
    const checkLogMap = new Map();
    
    // Group check log entries by Player + Item
    checkLogData.forEach((entry, index) => {
        const key = `${entry.Player}|${entry.Item}`;
        if (!checkLogMap.has(key)) {
            checkLogMap.set(key, []);
        }
        checkLogMap.get(key).push({ index, entry });
    });

    // Process each loot logger entry
    lootLoggerData.forEach(lootEntry => {
        const key = `${lootEntry.looted_by__name}|${lootEntry.item_name}`;
        const matchingEntries = checkLogMap.get(key);

        if (matchingEntries) {
            let remainingQuantity = lootEntry.quantity;
            
            // Process matching entries in order
            for (const { entry } of matchingEntries) {
                if (remainingQuantity <= 0) break;
                
                const reduceAmount = Math.min(remainingQuantity, entry.Amount);
                entry.Amount -= reduceAmount;
                remainingQuantity -= reduceAmount;
                
                // If amount reaches zero, mark for removal
                if (entry.Amount <= 0) {
                    entry._markedForRemoval = true;
                }
            }
        }
    });

    // Remove entries marked for removal
    for (let i = checkLogData.length - 1; i >= 0; i--) {
        if (checkLogData[i]._markedForRemoval) {
            checkLogData.splice(i, 1);
        }
    }
}

export function pruneOldTimestamps(lootLoggerData, checkLogData) {
    // Find the most recent timestamp from loot logger files
    let latestTimestamp = '';
    lootLoggerData.forEach(entry => {
        if (entry.timestamp_utc > latestTimestamp) {
            latestTimestamp = entry.timestamp_utc;
        }
    });

    if (!latestTimestamp) return;

    // Convert check log dates to ISO-8601 and filter
    for (let i = checkLogData.length - 1; i >= 0; i--) {
        const entry = checkLogData[i];
        
        // Convert MM/DD/YYYY HH:MM:SS to ISO-8601
        const isoDate = convertToISO8601(entry.Date);
        
        // Remove if timestamp is earlier than latest loot logger timestamp
        if (isoDate < latestTimestamp) {
            checkLogData.splice(i, 1);
        } else {
            // Update the date to ISO format
            entry.Date = isoDate;
        }
    }
}

export function convertToISO8601(dateString) {
    // Convert from "MM/DD/YYYY HH:MM:SS" to ISO-8601
    const [datePart, timePart] = dateString.split(' ');
    const [month, day, year] = datePart.split('/');
    
    // Format as YYYY-MM-DDTHH:MM:SS.sssZ
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${timePart}.000Z`;
}

export function generateLootLoggerOutput(data) {
    const header = 'timestamp_utc;looted_by__alliance;looted_by__guild;looted_by__name;item_id;item_name;quantity;looted_from__alliance;looted_from__guild;looted_from__name';
    const rows = data.map(entry => 
        Object.values(entry).join(';')
    );
    return [header, ...rows].join('\n');
}

export function generateCheckLogOutput(data) {
    const header = '"Date"\t"Player"\t"Item"\t"Enchantment"\t"Quality"\t"Amount"';
    const rows = data.map(entry => 
        `"${entry.Date}"\t"${entry.Player}"\t"${entry.Item}"\t"${entry.Enchantment}"\t"${entry.Quality}"\t"${entry.Amount}"`
    );
    return [header, ...rows].join('\n');
}