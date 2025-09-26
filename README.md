# Albion Online Loot Logger Viewer

A web-based tool for analyzing and visualizing loot logs from Albion Online. This application helps players track their loot history, donations, and item statistics from the popular MMORPG Albion Online.

> **Note**: This is a copy/fork of the original "ao-loot-logger-viewer" project.

## Features

- **Loot Log Analysis**: Parse and analyze loot logs from Albion Online
- **Player Statistics**: Track individual player loot statistics and history
- **Item Filtering**: Filter items by tier, category, and type
- **Donation Tracking**: Monitor guild chest donations and contributions
- **Visual Dashboard**: Clean, intuitive interface for viewing loot data
- **Data Sharing**: Share your loot analysis with others via generated URLs
- **Responsive Design**: Works on desktop and mobile devices

## Supported Log Formats

The application supports multiple log formats:
- Standard Albion Online loot logs
- Guild member logs
- Chest donation logs
- Albion Analysis format logs
- CSV and SSV formats

## Getting Started

### Prerequisites

- Modern web browser with JavaScript enabled
- Albion Online loot log files

### Usage

1. **Open the Application**: Navigate to the deployed web application
2. **Upload Log Files**: Drag and drop your Albion Online log files into the application
3. **View Analysis**: The application will automatically parse and display your loot statistics
4. **Filter Data**: Use the filter options to focus on specific items, players, or time periods
5. **Share Results**: Generate a shareable URL to share your analysis with others

### File Upload

You can upload the following types of files:
- Loot logs (`.txt` files containing loot information)
- Guild member lists
- Chest donation logs

The application will automatically detect the file format and parse it accordingly.

## Technical Details

### Architecture

This is a client-side web application built with:
- **Vue.js** - Frontend framework
- **Bootstrap 5** - UI components and styling
- **Firebase** - Analytics and data storage for sharing
- **Webpack** - Module bundling

### Data Sources

The application uses the official Albion Online data from:
- [ao-bin-dumps](https://github.com/ao-data/ao-bin-dumps) - Item database and localization

### Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Project Structure

```
├── index.html          # Main application entry point
├── css/                # Stylesheets
│   ├── chunk-vendors.5c22a29d.css
│   └── index.3691cc09.css
├── js/                 # JavaScript bundles
│   ├── chunk-vendors.f0d0706b.js
│   ├── chunk-2d0b1f6a.3b752c53.js
│   └── index.1e8e8952.js
└── favicon.ico         # Application icon
```

## Development

### Building from Source

This project appears to be built using Vue.js and Webpack. To build from source:

1. Clone the repository
2. Install dependencies: `npm install`
3. Build the project: `npm run build`
4. The built files will be in the `dist/` directory

### Dependencies

- Vue.js
- Bootstrap 5
- Firebase SDK
- Axios (for HTTP requests)
- Moment.js (for date handling)

## Privacy and Data Security

- All processing happens client-side in your browser
- Uploaded files are not stored on any server (unless you choose to share them)
- Shared data is stored temporarily in Firebase with auto-expiration
- No personal information is collected without your consent

## Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Albion Online community for their support
- ao-data team for maintaining the item database
- All contributors who have helped improve this tool
- Original "ao-loot-logger-viewer" project authors

## Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/ctse2k1/ao-loot-checker/issues) page
2. Create a new issue with detailed information about your problem

## Version Information

- **Current Version**: 1.0.0 (based on build artifacts)
- **Last Updated**: September 2025
- **Compatibility**: Albion Online current patch

---

*This tool is not officially affiliated with Albion Online or Sandbox Interactive GmbH. Albion Online is a registered trademark of Sandbox Interactive GmbH.*