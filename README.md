# AO Loot Checker

A lightweight web application for processing Loot Logger and Chest Log files to identify missing looted items.

## Features

- **Drag & Drop Interface**: Easy file upload with visual feedback
- **File Processing**: 
  - Process Loot Logger file(s) produced by AO Loot Logger
  - Process Chest Log file produced by Albion Online in-game chest log feature
  - Identify missing looted items by checking looted items in Loot Logger file(s) against the recorded items in Chest Log file
  - Chest Log file may have stale recorded items that are excluded from the processing
- **Client-Side Processing**: All processing happens in the browser
- **Error Handling**: Comprehensive validation and error messages
- **Unit Tests**: Complete test coverage for processing logic

## File Formats

### Loot Logger file(s) produced by AO Loot Logger
- **Format**: Semicolon-separated values
- **Header**: `timestamp_utc;looted_by__alliance;looted_by__guild;looted_by__name;item_id;item_name;quantity;looted_from__alliance;looted_from__guild;looted_from__name`
- **Example**: `2025-09-27T04:18:21.962Z;TOR;TEMPLARS_ORDER;SeeFarLong;T1_ALCHEMY_COMMON;Rare Animal Remains;110;;;@ISLAND@5020890d-fb76-4472-8e71-848601406ad2`

### Chest Log file produced by Albion Online in-game chest log feature
- **Format**: Tab-separated values with quoted fields
- **Header**: `"Date"\t"Player"\t"Item"\t"Enchantment"\t"Quality"\t"Amount"`
- **Example**: `"09/27/2025 04:18:27"\t"SeeFarLong"\t"Rare Animal Remains"\t"0"\t"1"\t"110"`

## Workflow

1. **Input**: User drags & drops:
   - First Loot Logger file (mandatory) - Confirmed loot items
   - Second Loot Logger file (optional) - Unconfirmed loot items
   - One Chest Log file (mandatory) - Recorded loot items

2. **Merge**: Combine first Loot Logger file and second Loot Logger file into a single output file in Loot Logger file format

3. **Identify timestamp**: Identify most recent timestamp among all loot items in the output Loot Logger file

4. **Copy**: Duplicate Chest Log file into an output file in Chest Log file format.

5. **Process timestamp**: Remove loot items in the output Chest Log file with timestamps older than the most timestamp found in the output Loot Logger file

6. **Match, Update and Remove**: For each loot item in the output Loot Logger file, find matches, then remove matched items from both the output Loot Logger file and output Chest Log file.

7. **Output**: Download the processed files

## Setup

### Prerequisites
- Node.js (version 18 or higher)
- npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ao-loot-checker
```

2. Install dependencies:
```bash
npm install
```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building

Build for production:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Testing

Run unit tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## Linting

Check code quality:
```bash
npm run lint
```

Fix linting issues automatically:
```bash
npm run lint:fix
```

## Deployment

### Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

### Netlify

1. Build the project:
```bash
npm run build
```

2. Deploy the `dist` folder to Netlify

### AWS Amplify

1. Connect your repository to AWS Amplify
2. Set build command: `npm run build`
3. Set publish directory: `dist`

## Project Structure

```
ao-loot-checker/
├── src/
│   ├── main.js          # Main application logic
│   └── processing.js    # Core processing functions
├── tests/
│   └── processing.test.js # Unit tests
├── index.html           # Main HTML file
├── package.json         # Dependencies and scripts
├── vite.config.js       # Vite configuration
├── jest.config.js       # Jest configuration
├── .eslintrc.js         # ESLint configuration
└── .github/workflows/   # CI/CD workflows
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run tests and linting
6. Submit a pull request

## License

MIT License - see LICENSE file for details.
