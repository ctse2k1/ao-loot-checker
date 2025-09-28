// Main application logic for AO Loot Checker
import {
    parseLootLoggerContent,
    parseCheckLogContent,
    mergeLootLoggerFiles,
    matchAndReduceQuantities,
    pruneOldTimestamps,
    generateLootLoggerOutput,
    generateCheckLogOutput
} from './processing.js';

class LootChecker {
    constructor() {
        this.confirmedLootFile = null;
        this.unconfirmedLootFile = null;
        this.checkLogFile = null;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Drop zone event listeners
        const confirmedLootZone = document.getElementById('confirmed-loot-zone');
        const unconfirmedLootZone = document.getElementById('unconfirmed-loot-zone');
        const chestLogZone = document.getElementById('chest-log-zone');
        const processBtn = document.getElementById('process-btn');

        this.setupDropZone(confirmedLootZone, this.handleConfirmedLootDrop.bind(this));
        this.setupDropZone(unconfirmedLootZone, this.handleUnconfirmedLootDrop.bind(this));
        this.setupDropZone(chestLogZone, this.handleCheckLogDrop.bind(this));

        processBtn.addEventListener('click', this.processFiles.bind(this));
    }

    setupDropZone(zone, dropHandler) {
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('dragover');
        });

        zone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            zone.classList.remove('dragover');
        });

        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('dragover');
            const files = Array.from(e.dataTransfer.files);
            dropHandler(files);
        });
    }

    handleConfirmedLootDrop(files) {
        const validFiles = files.filter(file => 
            file.name.endsWith('.txt') || file.name.endsWith('.csv')
        );

        if (validFiles.length === 0) {
            this.showError('Please drop valid text files (.txt or .csv)');
            return;
        }

        if (validFiles.length > 1) {
            this.showError('Only one Confirmed Loot Logger file allowed');
            return;
        }

        this.confirmedLootFile = validFiles[0];
        this.updateFileInfo('confirmed-loot-info', this.confirmedLootFile.name);
        
        document.getElementById('confirmed-loot-zone').classList.add('has-file');
        this.updateProcessButton();
    }

    handleUnconfirmedLootDrop(files) {
        const validFiles = files.filter(file => 
            file.name.endsWith('.txt') || file.name.endsWith('.csv')
        );

        if (validFiles.length === 0) {
            this.showError('Please drop valid text files (.txt or .csv)');
            return;
        }

        if (validFiles.length > 1) {
            this.showError('Only one Unconfirmed Loot Logger file allowed');
            return;
        }

        this.unconfirmedLootFile = validFiles[0];
        this.updateFileInfo('unconfirmed-loot-info', this.unconfirmedLootFile.name);
        
        document.getElementById('unconfirmed-loot-zone').classList.add('has-file');
        this.updateProcessButton();
    }

    handleCheckLogDrop(files) {
        const validFiles = files.filter(file => 
            file.name.endsWith('.txt') || file.name.endsWith('.csv')
        );

        if (validFiles.length === 0) {
            this.showError('Please drop valid text files (.txt or .csv)');
            return;
        }

        if (validFiles.length > 1) {
            this.showError('Only one Chest Log file allowed');
            return;
        }

        this.checkLogFile = validFiles[0];
        this.updateFileInfo('chest-log-info', this.checkLogFile.name);
        
        document.getElementById('chest-log-zone').classList.add('has-file');
        this.updateProcessButton();
    }

    updateFileInfo(elementId, text) {
        const element = document.getElementById(elementId);
        element.textContent = text;
    }

    updateProcessButton() {
        const processBtn = document.getElementById('process-btn');
        const hasConfirmedLoot = this.confirmedLootFile !== null;
        const hasCheckLog = this.checkLogFile !== null;
        
        processBtn.disabled = !(hasConfirmedLoot && hasCheckLog);
    }

    async processFiles() {
        this.showProgress(true);
        this.hideError();
        this.hideOutput();

        try {
            // Step 1: Parse all files
            this.updateProgress(10, 'Parsing files...');
            
            const lootLoggerData = [];
            
            // Parse confirmed loot file (mandatory)
            const confirmedLootData = await this.parseLootLoggerFile(this.confirmedLootFile);
            lootLoggerData.push(confirmedLootData);
            
            // Parse unconfirmed loot file (optional)
            if (this.unconfirmedLootFile) {
                const unconfirmedLootData = await this.parseLootLoggerFile(this.unconfirmedLootFile);
                lootLoggerData.push(unconfirmedLootData);
            }
            
            const checkLogData = await this.parseCheckLogFile(this.checkLogFile);

            // Step 2: Merge Type #1 files
            this.updateProgress(30, 'Merging Loot Logger files...');
            const mergedLootLogger = mergeLootLoggerFiles(lootLoggerData);

            // Step 3: Copy Type #2 file
            this.updateProgress(40, 'Processing Chest Log...');
            const outputCheckLog = [...checkLogData];

            // Step 4: Timestamp pruning
            this.updateProgress(60, 'Pruning old timestamps...');
            pruneOldTimestamps(mergedLootLogger, outputCheckLog);

            // Step 5: Matching and reduction
            this.updateProgress(80, 'Matching and reducing quantities...');
            matchAndReduceQuantities(mergedLootLogger, outputCheckLog);

            // Step 6: Generate output files
            this.updateProgress(90, 'Generating output files...');
            const lootLoggerOutput = generateLootLoggerOutput(mergedLootLogger);
            const checkLogOutput = generateCheckLogOutput(outputCheckLog);

            // Step 7: Create download links
            this.updateProgress(100, 'Complete!');
            this.createDownloadLinks(lootLoggerOutput, checkLogOutput);
            this.showOutput();

        } catch (error) {
            this.showError(`Error processing files: ${error.message}`);
        } finally {
            this.showProgress(false);
        }
    }

    async parseLootLoggerFile(file) {
        const text = await file.text();
        return parseLootLoggerContent(text);
    }

    async parseCheckLogFile(file) {
        const text = await file.text();
        return parseCheckLogContent(text);
    }

    createDownloadLinks(lootLoggerContent, checkLogContent) {
        const lootLoggerBlob = new Blob([lootLoggerContent], { type: 'text/plain' });
        const checkLogBlob = new Blob([checkLogContent], { type: 'text/plain' });

        const lootLoggerUrl = URL.createObjectURL(lootLoggerBlob);
        const checkLogUrl = URL.createObjectURL(checkLogBlob);

        document.getElementById('download-loot-logger').href = lootLoggerUrl;
        document.getElementById('download-loot-logger').download = 'missing_loot_items.txt';

        document.getElementById('download-chest-log').href = checkLogUrl;
        document.getElementById('download-chest-log').download = 'remaining_chest_items.txt';
    }

    showProgress(show) {
        const container = document.getElementById('progress-container');
        container.classList.toggle('hidden', !show);
    }

    updateProgress(percent, message) {
        const fill = document.getElementById('progress-fill');
        const container = document.getElementById('progress-container');
        
        fill.style.width = `${percent}%`;
        container.querySelector('p').textContent = message;
    }

    showError(message) {
        const errorElement = document.getElementById('error-message');
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
    }

    hideError() {
        document.getElementById('error-message').classList.add('hidden');
    }

    showOutput() {
        document.getElementById('output-container').classList.remove('hidden');
    }

    hideOutput() {
        document.getElementById('output-container').classList.add('hidden');
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new LootChecker();
});