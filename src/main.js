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
        this.lootLoggerFiles = [];
        this.checkLogFile = null;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Drop zone event listeners
        const lootLoggerZone = document.getElementById('loot-logger-zone');
        const chestLogZone = document.getElementById('chest-log-zone');
        const processBtn = document.getElementById('process-btn');

        this.setupDropZone(lootLoggerZone, this.handleLootLoggerDrop.bind(this));
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

    handleLootLoggerDrop(files) {
        const validFiles = files.filter(file => 
            file.name.endsWith('.txt') || file.name.endsWith('.csv')
        );

        if (validFiles.length === 0) {
            this.showError('Please drop valid text files (.txt or .csv)');
            return;
        }

        // Allow up to 2 files for Type #1
        if (this.lootLoggerFiles.length + validFiles.length > 2) {
            this.showError('Maximum 2 Loot Logger files allowed');
            return;
        }

        this.lootLoggerFiles.push(...validFiles);
        this.updateFileInfo('loot-logger-info', 
            this.lootLoggerFiles.map(f => f.name).join(', '));
        
        document.getElementById('loot-logger-zone').classList.add('has-file');
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
        const hasLootLogger = this.lootLoggerFiles.length >= 1;
        const hasCheckLog = this.checkLogFile !== null;
        
        processBtn.disabled = !(hasLootLogger && hasCheckLog);
    }

    async processFiles() {
        this.showProgress(true);
        this.hideError();
        this.hideOutput();

        try {
            // Step 1: Parse all files
            this.updateProgress(10, 'Parsing files...');
            
            const lootLoggerData = await Promise.all(
                this.lootLoggerFiles.map(file => this.parseLootLoggerFile(file))
            );
            
            const checkLogData = await this.parseCheckLogFile(this.checkLogFile);

            // Step 2: Merge Type #1 files
            this.updateProgress(30, 'Merging Loot Logger files...');
            const mergedLootLogger = mergeLootLoggerFiles(lootLoggerData);

            // Step 3: Copy Type #2 file
            this.updateProgress(40, 'Processing Chest Log...');
            const outputCheckLog = [...checkLogData];

            // Step 4: Matching and reduction
            this.updateProgress(60, 'Matching and reducing quantities...');
            matchAndReduceQuantities(mergedLootLogger, outputCheckLog);

            // Step 5: Timestamp pruning
            this.updateProgress(80, 'Pruning old timestamps...');
            pruneOldTimestamps(mergedLootLogger, outputCheckLog);

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
        document.getElementById('download-loot-logger').download = 'merged_loot_logger.txt';

        document.getElementById('download-chest-log').href = checkLogUrl;
        document.getElementById('download-chest-log').download = 'updated_chest_log.txt';
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