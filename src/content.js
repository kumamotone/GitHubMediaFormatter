// Content script to convert image markdown in GitHub PR screens

// Set up DOM change monitoring to detect text areas and add conversion buttons
const observer = new MutationObserver((mutations) => {
  const textAreas = document.querySelectorAll('textarea.js-comment-field');
  textAreas.forEach(textArea => {
    if (!textArea.dataset.imageFormatterAttached) {
      addFormatButton(textArea);
      textArea.dataset.imageFormatterAttached = "true";
    }
  });
});

// Monitor changes across the entire page
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Execute on initial load
document.addEventListener('DOMContentLoaded', () => {
  const textAreas = document.querySelectorAll('textarea.js-comment-field');
  textAreas.forEach(textArea => {
    addFormatButton(textArea);
    textArea.dataset.imageFormatterAttached = "true";
  });
});

/**
 * Add conversion button near the text area
 * @param {HTMLTextAreaElement} textArea - Target text area
 */
function addFormatButton(textArea) {
  // Look for existing markdown-toolbar element (GitHub's markdown toolbar)
  let toolbarArea = textArea.closest('.form-actions')?.querySelector('.markdown-toolbar');
  
  // If toolbar not found, look in another location
  if (!toolbarArea) {
    toolbarArea = textArea.closest('.comment-form-wrapper')?.querySelector('.markdown-toolbar');
  }
  
  // If still not found, create our own container
  if (!toolbarArea) {
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'image-formatter-container';
    buttonContainer.style.margin = '5px 0';
    
    // Create button
    const formatButton = document.createElement('button');
    formatButton.innerText = 'Format Selected Media';
    formatButton.className = 'btn btn-sm';
    formatButton.style.marginRight = '5px';
    formatButton.type = 'button'; // Explicitly specify button type to prevent submission
    
    // Button click handler
    formatButton.addEventListener('click', (event) => {
      // Prevent default submit action
      event.preventDefault();
      event.stopPropagation();
      
      // Get selection range
      const start = textArea.selectionStart;
      const end = textArea.selectionEnd;
      
      // Only process if there is a selection
      if (start !== end) {
        const fullText = textArea.value;
        const selectedText = fullText.substring(start, end);
        const formattedSelection = formatImageMarkdown(selectedText);
        
        // Replace selection with formatted text
        textArea.value = fullText.substring(0, start) + formattedSelection + fullText.substring(end);
        
        // Maintain selection state (adjusted for formatted text length)
        textArea.selectionStart = start;
        textArea.selectionEnd = start + formattedSelection.length;
      } else {
        // Show alert if no selection
        alert('Please select text before clicking the "Format Selected Media" button.');
      }
      
      // Return focus to textarea
      textArea.focus();
      
      return false;
    });
    
    // Add button to parent element
    buttonContainer.appendChild(formatButton);
    
    // Insert after textarea
    textArea.parentNode.insertBefore(buttonContainer, textArea.nextSibling);
  } else {
    // Add button to existing toolbar
    const formatButton = document.createElement('button');
    formatButton.className = 'toolbar-item btn-octicon';
    formatButton.type = 'button';
    formatButton.style.marginLeft = '5px';
    
    // Add GitHub-style icon
    const svgIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgIcon.setAttribute('class', 'octicon octicon-image');
    svgIcon.setAttribute('viewBox', '0 0 16 16');
    svgIcon.setAttribute('width', '16');
    svgIcon.setAttribute('height', '16');
    svgIcon.setAttribute('aria-hidden', 'true');
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M1.75 2.5a.25.25 0 0 0-.25.25v10.5c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25V2.75a.25.25 0 0 0-.25-.25H1.75zM0 2.75C0 1.784.784 1 1.75 1h12.5c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0 1 14.25 15H1.75A1.75 1.75 0 0 1 0 13.25V2.75zm11.75 7.75a.75.75 0 0 0 0-1.5h-1a.75.75 0 0 0 0 1.5h1zm-3-4a2 2 0 1 0 0 4 2 2 0 0 0 0-4z');
    
    svgIcon.appendChild(path);
    formatButton.appendChild(svgIcon);
    
    // Add tooltip text
    formatButton.setAttribute('title', 'Format Selected Media');
    formatButton.setAttribute('aria-label', 'Format Selected Media');
    
    // Button click handler
    formatButton.addEventListener('click', (event) => {
      // Prevent default submit action
      event.preventDefault();
      event.stopPropagation();
      
      // Get selection range
      const start = textArea.selectionStart;
      const end = textArea.selectionEnd;
      
      // Only process if there is a selection
      if (start !== end) {
        const fullText = textArea.value;
        const selectedText = fullText.substring(start, end);
        const formattedSelection = formatImageMarkdown(selectedText);
        
        // Replace selection with formatted text
        textArea.value = fullText.substring(0, start) + formattedSelection + fullText.substring(end);
        
        // Maintain selection state (adjusted for formatted text length)
        textArea.selectionStart = start;
        textArea.selectionEnd = start + formattedSelection.length;
        
        // Fire HTML input event to update GitHub preview
        const inputEvent = new Event('input', { bubbles: true });
        textArea.dispatchEvent(inputEvent);
      } else {
        // Show alert if no selection
        alert('Please select text before clicking the "Format Selected Media" button.');
      }
      
      // Return focus to textarea
      textArea.focus();
      
      return false;
    });
    
    // Add button to end of toolbar
    toolbarArea.appendChild(formatButton);
  }
}

/**
 * Convert image and video markdown in text
 * @param {string} text - Text to convert
 * @returns {string} - Converted text
 */
function formatImageMarkdown(text) {
  // Regular expression to detect image markdown
  const imageMarkdownRegex = /!\[(.*?)\]\((.*?)\)/g;
  // Regular expression to detect GitHub asset URLs
  const githubAssetUrlRegex = /(https:\/\/github\.com\/user-attachments\/assets\/[a-zA-Z0-9-]+)/g;
  
  // Array to store media elements in the text
  const mediaElements = [];
  
  // Set to track processed media URLs
  const processedUrls = new Set();
  
  // First, look for Markdown format images - treat these as images
  let imageMatch;
  while ((imageMatch = imageMarkdownRegex.exec(text)) !== null) {
    const fullMatch = imageMatch[0];
    const altText = imageMatch[1];
    const url = imageMatch[2];
    
    // Mark URL as processed
    processedUrls.add(url);
    
    mediaElements.push({
      fullMatch: fullMatch,
      altText: altText,
      url: url,
      type: 'image'
    });
  }
  
  // Next, look for standalone URLs - treat these as videos
  // (excluding URLs already processed as images)
  let urlMatch;
  while ((urlMatch = githubAssetUrlRegex.exec(text)) !== null) {
    const url = urlMatch[0];
    
    // Check if URL has not been processed in Markdown
    // Also ensure URL is not part of a larger Markdown syntax
    if (!processedUrls.has(url) && !text.includes(`![`+url) && !text.includes(`](${url})`)) {
      // Check surrounding text to confirm this URL exists independently
      const urlStart = text.indexOf(url);
      const urlEnd = urlStart + url.length;
      const prevChar = urlStart > 0 ? text[urlStart - 1] : '';
      const nextChar = urlEnd < text.length ? text[urlEnd] : '';
      
      // Check if URL is standalone (surrounded by spaces, newlines, or end of text)
      if (/[\s\n,]/.test(prevChar) || prevChar === '' || /[\s\n,.]/.test(nextChar) || nextChar === '') {
        mediaElements.push({
          fullMatch: url,
          altText: "Video",
          url: url,
          type: 'video'
        });
        processedUrls.add(url);
      }
    }
  }
  
  // Convert based on number of media elements
  let formattedText = text;
  
  if (mediaElements.length === 1) {
    // For a single media element
    const media = mediaElements[0];
    if (media.type === 'image') {
      // Image → convert to <img src="..." width="300">
      formattedText = formattedText.replace(
        media.fullMatch,
        `<img src="${media.url}" width="300" alt="${media.altText}">`
      );
    } else if (media.type === 'video') {
      // Video → convert to <video> tag
      formattedText = formattedText.replace(
        media.fullMatch,
        `<video src="${media.url}" width="400" height="auto" controls></video>`
      );
    }
  } else if (mediaElements.length === 2) {
    // For two media elements → convert to 2-column table (1 row, 2 columns)
    let tableHtml = '<table><tr>\n';
    
    // Temporarily save original text
    const originalText = formattedText;
    formattedText = '';
    
    mediaElements.forEach(media => {
      if (media.type === 'image') {
        tableHtml += `  <td><img src="${media.url}" width="300" alt="${media.altText}"></td>\n`;
      } else if (media.type === 'video') {
        tableHtml += `  <td><video src="${media.url}" width="300" height="auto" controls></video></td>\n`;
      }
      // This processing is unnecessary (will be batch processed later)
    });
    
    tableHtml += '</tr></table>\n\n';
    
    // New string to hold text after removing media elements
    let cleanedText = originalText;
    
    // Replace each media element's fullMatch in sequence
    mediaElements.forEach(media => {
      cleanedText = cleanedText.replace(media.fullMatch, '');
    });
    
    formattedText = tableHtml + cleanedText.trim();
  } else if (mediaElements.length === 3) {
    // For three media elements → convert to 3-column table (1 row, 3 columns)
    let tableHtml = '<table><tr>\n';
    
    // Temporarily save original text
    const originalText = formattedText;
    formattedText = '';
    
    mediaElements.forEach(media => {
      if (media.type === 'image') {
        tableHtml += `  <td><img src="${media.url}" width="300" alt="${media.altText}"></td>\n`;
      } else if (media.type === 'video') {
        tableHtml += `  <td><video src="${media.url}" width="300" height="auto" controls></video></td>\n`;
      }
    });
    
    tableHtml += '</tr></table>\n\n';
    
    // New string to hold text after removing media elements
    let cleanedText = originalText;
    
    // Replace each media element's fullMatch in sequence
    mediaElements.forEach(media => {
      cleanedText = cleanedText.replace(media.fullMatch, '');
    });
    
    formattedText = tableHtml + cleanedText.trim();
  } else if (mediaElements.length >= 4) {
    // Display error message for 4 or more media elements
    alert('Cannot convert more than 3 media elements (images/videos). Please limit to 3 or fewer.');
  }
  
  return formattedText;
}

/**
 * Function used to run tests
 * @param {string} input - Test input
 * @param {string} expectedOutput - Expected output
 * @param {string} description - Test description
 * @returns {boolean} - Whether the test succeeded
 */
function runTest(input, expectedOutput, description) {
  const output = formatImageMarkdown(input);
  const success = output === expectedOutput;
  
  console.log(`Test: ${description}`);
  console.log(`Input: ${input}`);
  console.log(`Output: ${output}`);
  console.log(`Expected output: ${expectedOutput}`);
  console.log(`Result: ${success ? 'Success ✅' : 'Failure ❌'}`);
  
  return success;
}

/**
 * Function to run test cases
 */
function runTests() {
  // Test case 1: Single image
  const test1 = {
    input: '![Simulator Screenshot](https://github.com/user-attachments/assets/3a167be4-81d1-4c0d-9c5c-db53e8cd6dd4)',
    expected: '<img src="https://github.com/user-attachments/assets/3a167be4-81d1-4c0d-9c5c-db53e8cd6dd4" width="300" alt="Simulator Screenshot">',
    description: 'Single image is correctly converted'
  };
  
  // Test case 2: Single video
  const test2 = {
    input: 'https://github.com/user-attachments/assets/463db957-cd5e-4679-b1f2-ccd6e4f1433e',
    expected: '<video src="https://github.com/user-attachments/assets/463db957-cd5e-4679-b1f2-ccd6e4f1433e" width="400" height="auto" controls></video>',
    description: 'Single video is correctly converted'
  };
  
  // Test case 3: Combination of image and video
  const test3 = {
    input: '![Image](https://github.com/user-attachments/assets/abcd1234)\n\nhttps://github.com/user-attachments/assets/efgh5678',
    expected: '<table><tr>\n  <td><img src="https://github.com/user-attachments/assets/abcd1234" width="300" alt="Image"></td>\n  <td><video src="https://github.com/user-attachments/assets/efgh5678" width="300" height="auto" controls></video></td>\n</tr></table>\n\n',
    description: 'Image and video are correctly converted to table'
  };
  
  // Run test cases
  const results = [
    runTest(test1.input, test1.expected, test1.description),
    runTest(test2.input, test2.expected, test2.description),
    runTest(test3.input, test3.expected, test3.description)
  ];
  
  // Display overall results
  const totalTests = results.length;
  const passedTests = results.filter(r => r).length;
  
  console.log(`\n=====================================`);
  console.log(`Test results: ${passedTests}/${totalTests} passed`);
  console.log(`=====================================`);
}

// Export to allow running tests manually from console
if (typeof window !== 'undefined') {
  window.runMediaFormatterTests = runTests;
}