# GitHub Media Formatter - Claude Guidelines

## Commands
- Install dependencies: `./install-deps.sh` or `npm install`
- Build the extension: `npm run build` (outputs to dist/)
- Development mode: `npm run dev` (watch mode)
- Package for distribution: `npm run package` (creates github-media-formatter.zip)
- Run all tests: `npm test` or `node src/test.js`
- Run a single test: `node -e "require('./src/test.js').runTest('input', 'expected', 'description')"`
- Browser extension: Load unpacked extension in Chrome from dist directory
- Manual testing: Open GitHub PR/Issue, add `window.runMediaFormatterTests()` in console

## Code Style
- Language: JavaScript (ES6+)
- Indentation: 2 spaces
- Doc comments: JSDoc style with @param, @returns, etc.
- Naming: camelCase for variables/functions, hyphen-case for CSS classes
- Function length: Keep functions focused and under 50 lines when possible
- Error handling: Use alerts for user feedback, console.log for debugging
- DOM interactions: Always check element existence before manipulating
- Regex: Use clear variable names for regex patterns and captures
- Media width: 300px for images in tables, 400px for single videos

## Architecture
- Browser extension with content script (content.js)
- Observer pattern to detect GitHub textarea elements
- Main functionality: formatImageMarkdown() to transform media markdown
- Separate test script (test.js) for Node.js testing environment