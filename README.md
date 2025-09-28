# AO Loot Checker

A lightweight web application for processing Loot Logger and Check Log files to match and reduce item quantities.

## Features

- **Drag & Drop Interface**: Easy file upload with visual feedback
- **File Processing**: 
  - Merge multiple Loot Logger files (Type #1)
  - Process Check Log files (Type #2)
  - Match items between files and reduce quantities
  - Prune old timestamps based on loot activity
- **Client-Side Processing**: All processing happens in the browser
- **Error Handling**: Comprehensive validation and error messages
- **Unit Tests**: Complete test coverage for processing logic

## File Formats

### Type #1 - Loot Logger
- **Format**: Semicolon-separated values
- **Header**: `timestamp_utc;looted_by__alliance;looted_by__guild;looted_by__name;item_id;item_name;quantity;looted_from__alliance;looted_from__guild;looted_from__name`
- **Example**: `2025-09-27T04:19:58.481Z;Alliance;GuildX;PlayerA;12345;Sword of Dawn;1;Alliance;GuildY;PlayerB`

### Type #2 - Check Log
- **Format**: Tab-separated values with quoted fields
- **Header**: `"Date"\t"Player"\t"Item"\t"Enchantment"\t"Quality"\t"Amount"`
- **Example**: `"09/27/2025 04:20:06"\t"PlayerA"\t"Shield of Light"\t"None"\t"Rare"\t"2"`

## Workflow

1. **Input**: User drags & drops:
   - At least one Type #1 file (mandatory)
   - One Type #2 file (mandatory)
   - Optional second Type #1 file

2. **Merge**: Combine Type #1 files into a single output file

3. **Copy**: Duplicate Type #2 file into output

4. **Matching & Reduction**: For each loot item, find matches and reduce quantities

5. **Timestamp Pruning**: Remove items with timestamps older than the most recent loot activity

6. **Output**: Download the processed files

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

## Sample Test Data

### Loot Logger Sample
```
timestamp_utc;looted_by__alliance;looted_by__guild;looted_by__name;item_id;item_name;quantity;looted_from__alliance;looted_from__guild;looted_from__name
2025-09-27T04:19:58.481Z;Alliance;GuildX;PlayerA;12345;Sword of Dawn;1;Alliance;GuildY;PlayerB
2025-09-27T05:20:00.000Z;Alliance;GuildX;PlayerA;67890;Shield of Light;2;Alliance;GuildZ;PlayerC
```

### Check Log Sample
```
"Date"\t"Player"\t"Item"\t"Enchantment"\t"Quality"\t"Amount"
"09/27/2025 04:20:06"\t"PlayerA"\t"Sword of Dawn"\t"None"\t"Rare"\t"5"
"09/27/2025 04:21:00"\t"PlayerA"\t"Shield of Light"\t"None"\t"Common"\t"3"
```

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