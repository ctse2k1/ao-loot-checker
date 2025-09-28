// Unit tests for AO Loot Checker processing logic

import {
    parseLootLoggerContent,
    parseCheckLogContent,
    mergeLootLoggerFiles,
    matchAndReduceQuantities,
    pruneOldTimestamps,
    convertToISO8601
} from '../src/processing.js';

describe('File Parsing', () => {
    describe('Loot Logger Parsing', () => {
        test('should parse valid Loot Logger content', () => {
            const content = `timestamp_utc;looted_by__alliance;looted_by__guild;looted_by__name;item_id;item_name;quantity;looted_from__alliance;looted_from__guild;looted_from__name
2025-09-27T04:19:58.481Z;Alliance;GuildX;PlayerA;12345;Sword of Dawn;1;Alliance;GuildY;PlayerB`;
            
            const result = parseLootLoggerContent(content);
            
            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                timestamp_utc: '2025-09-27T04:19:58.481Z',
                looted_by__alliance: 'Alliance',
                looted_by__guild: 'GuildX',
                looted_by__name: 'PlayerA',
                item_id: '12345',
                item_name: 'Sword of Dawn',
                quantity: 1,
                looted_from__alliance: 'Alliance',
                looted_from__guild: 'GuildY',
                looted_from__name: 'PlayerB'
            });
        });

        test('should throw error for invalid header', () => {
            const content = `invalid_header;field2;field3
2025-09-27T04:19:58.481Z;Alliance;GuildX`;
            
            expect(() => parseLootLoggerContent(content)).toThrow('Invalid Loot Logger file format');
        });

        test('should skip malformed rows', () => {
            const content = `timestamp_utc;looted_by__alliance;looted_by__guild;looted_by__name;item_id;item_name;quantity;looted_from__alliance;looted_from__guild;looted_from__name
2025-09-27T04:19:58.481Z;Alliance;GuildX;PlayerA;12345;Sword of Dawn;1;Alliance;GuildY;PlayerB
malformed_row`;
            
            const result = parseLootLoggerContent(content);
            
            expect(result).toHaveLength(1);
        });
    });

    describe('Chest Log Parsing', () => {
        test('should parse valid Chest Log content', () => {
            const content = `"Date"\t"Player"\t"Item"\t"Enchantment"\t"Quality"\t"Amount"
"09/27/2025 04:20:06"\t"PlayerA"\t"Shield of Light"\t"None"\t"Rare"\t"2"`;
            
            const result = parseCheckLogContent(content);
            
            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                Date: '09/27/2025 04:20:06',
                Player: 'PlayerA',
                Item: 'Shield of Light',
                Enchantment: 'None',
                Quality: 'Rare',
                Amount: 2
            });
        });

        test('should throw error for invalid header', () => {
            const content = `"Invalid"\t"Header"
"09/27/2025 04:20:06"\t"PlayerA"`;
            
            expect(() => parseCheckLogContent(content)).toThrow('Invalid Chest Log file format');
        });

        test('should skip malformed rows', () => {
            const content = `"Date"\t"Player"\t"Item"\t"Enchantment"\t"Quality"\t"Amount"
"09/27/2025 04:20:06"\t"PlayerA"\t"Shield of Light"\t"None"\t"Rare"\t"2"
malformed_row`;
            
            const result = parseCheckLogContent(content);
            
            expect(result).toHaveLength(1);
        });
    });
});

describe('File Merging', () => {
    test('should merge multiple Loot Logger files', () => {
        const file1 = [
            { timestamp_utc: '2025-09-27T01:00:00.000Z', item_name: 'Item1', quantity: 1 }
        ];
        const file2 = [
            { timestamp_utc: '2025-09-27T02:00:00.000Z', item_name: 'Item2', quantity: 2 }
        ];
        
        const result = mergeLootLoggerFiles([file1, file2]);
        
        expect(result).toHaveLength(2);
        expect(result[0].item_name).toBe('Item1');
        expect(result[1].item_name).toBe('Item2');
    });

    test('should handle empty files', () => {
        const result = mergeLootLoggerFiles([[], []]);
        expect(result).toHaveLength(0);
    });
});

describe('Matching and Reduction', () => {
    test('should reduce quantities for matching entries in both files', () => {
        const lootLoggerData = [
            {
                looted_by__name: 'PlayerA',
                item_name: 'Sword of Dawn',
                quantity: 3
            }
        ];
        
        const checkLogData = [
            {
                Player: 'PlayerA',
                Item: 'Sword of Dawn',
                Amount: 5
            },
            {
                Player: 'PlayerA',
                Item: 'Sword of Dawn',
                Amount: 2
            }
        ];
        
        matchAndReduceQuantities(lootLoggerData, checkLogData);
        
        // Loot logger quantity should be reduced to 0 and removed
        expect(lootLoggerData).toHaveLength(0);
        
        // First chest log entry should be reduced by 3, second entry unchanged
        expect(checkLogData[0].Amount).toBe(2); // 5 - 3 = 2
        expect(checkLogData[1].Amount).toBe(2); // Unchanged
    });

    test('should remove entries when quantities reach zero in both files', () => {
        const lootLoggerData = [
            {
                looted_by__name: 'PlayerA',
                item_name: 'Sword of Dawn',
                quantity: 5
            }
        ];
        
        const checkLogData = [
            {
                Player: 'PlayerA',
                Item: 'Sword of Dawn',
                Amount: 3
            },
            {
                Player: 'PlayerA',
                Item: 'Sword of Dawn',
                Amount: 2
            }
        ];
        
        matchAndReduceQuantities(lootLoggerData, checkLogData);
        
        // Both loot logger and chest log entries should be removed
        expect(lootLoggerData).toHaveLength(0);
        expect(checkLogData).toHaveLength(0);
    });

    test('should handle partial reduction across multiple chest log entries', () => {
        const lootLoggerData = [
            {
                looted_by__name: 'PlayerA',
                item_name: 'Sword of Dawn',
                quantity: 4
            }
        ];
        
        const checkLogData = [
            {
                Player: 'PlayerA',
                Item: 'Sword of Dawn',
                Amount: 2
            },
            {
                Player: 'PlayerA',
                Item: 'Sword of Dawn',
                Amount: 1
            },
            {
                Player: 'PlayerA',
                Item: 'Sword of Dawn',
                Amount: 3
            }
        ];
        
        matchAndReduceQuantities(lootLoggerData, checkLogData);
        
        // Loot logger should be removed (quantity reached 0)
        expect(lootLoggerData).toHaveLength(0);
        
        // First two chest log entries should be removed, third should have 2 remaining
        expect(checkLogData).toHaveLength(1);
        expect(checkLogData[0].Amount).toBe(2); // 3 - 1 = 2
    });

    test('should handle non-matching entries', () => {
        const lootLoggerData = [
            {
                looted_by__name: 'PlayerB',
                item_name: 'Different Item',
                quantity: 3
            }
        ];
        
        const checkLogData = [
            {
                Player: 'PlayerA',
                Item: 'Sword of Dawn',
                Amount: 5
            }
        ];
        
        const originalLootLoggerData = [...lootLoggerData];
        const originalCheckLogData = [...checkLogData];
        matchAndReduceQuantities(lootLoggerData, checkLogData);
        
        // No changes should occur for non-matching entries
        expect(lootLoggerData).toEqual(originalLootLoggerData);
        expect(checkLogData).toEqual(originalCheckLogData);
    });

    test('should process multiple loot logger items correctly', () => {
        const lootLoggerData = [
            {
                looted_by__name: 'PlayerA',
                item_name: 'Sword of Dawn',
                quantity: 2
            },
            {
                looted_by__name: 'PlayerB',
                item_name: 'Shield of Light',
                quantity: 3
            }
        ];
        
        const checkLogData = [
            {
                Player: 'PlayerA',
                Item: 'Sword of Dawn',
                Amount: 5
            },
            {
                Player: 'PlayerB',
                Item: 'Shield of Light',
                Amount: 2
            }
        ];
        
        matchAndReduceQuantities(lootLoggerData, checkLogData);
        
        // PlayerA's loot logger item should be removed (quantity reached 0)
        // PlayerB's loot logger item should remain with quantity 1 (3 - 2 = 1)
        expect(lootLoggerData).toHaveLength(1);
        expect(lootLoggerData[0].looted_by__name).toBe('PlayerB');
        expect(lootLoggerData[0].quantity).toBe(1);
        
        // Chest log entries should be reduced
        expect(checkLogData).toHaveLength(1); // Only first entry remains
        expect(checkLogData[0].Amount).toBe(3); // 5 - 2 = 3
        // Second chest log entry should be removed (Amount reached 0)
    });
});

describe('Timestamp Pruning', () => {
    test('should remove entries with timestamps before latest loot logger timestamp', () => {
        const lootLoggerData = [
            { timestamp_utc: '2025-09-27T03:00:00.000Z' }
        ];
        
        const checkLogData = [
            { Date: '09/27/2025 01:00:00', Player: 'PlayerA', Item: 'Item1', Amount: 1 },
            { Date: '09/27/2025 04:00:00', Player: 'PlayerB', Item: 'Item2', Amount: 2 }
        ];
        
        pruneOldTimestamps(lootLoggerData, checkLogData);
        
        // Only the entry with timestamp after 03:00:00 should remain
        expect(checkLogData).toHaveLength(1);
        expect(checkLogData[0].Player).toBe('PlayerB');
    });

    test('should convert dates to ISO-8601 format', () => {
        const lootLoggerData = [
            { timestamp_utc: '2025-09-27T01:00:00.000Z' }
        ];
        
        const checkLogData = [
            { Date: '09/27/2025 02:00:00', Player: 'PlayerA', Item: 'Item1', Amount: 1 }
        ];
        
        pruneOldTimestamps(lootLoggerData, checkLogData);
        
        // Date should be converted to ISO format
        expect(checkLogData[0].Date).toBe('2025-09-27T02:00:00.000Z');
    });

    test('should handle empty data', () => {
        const lootLoggerData = [];
        const checkLogData = [];
        
        // Should not throw errors with empty data
        expect(() => pruneOldTimestamps(lootLoggerData, checkLogData)).not.toThrow();
        expect(checkLogData).toHaveLength(0);
    });
});

describe('Date Conversion', () => {
    test('should convert MM/DD/YYYY HH:MM:SS to ISO-8601', () => {
        const result = convertToISO8601('09/27/2025 14:30:25');
        expect(result).toBe('2025-09-27T14:30:25.000Z');
    });

    test('should handle single-digit months and days', () => {
        const result = convertToISO8601('1/2/2025 05:06:07');
        expect(result).toBe('2025-01-02T05:06:07.000Z');
    });

    test('should handle midnight times', () => {
        const result = convertToISO8601('12/31/2025 00:00:00');
        expect(result).toBe('2025-12-31T00:00:00.000Z');
    });
});