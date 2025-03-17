// GitHubのPR画面で画像のMarkdownを変換するためのコンテンツスクリプト

// DOM変更の監視を設定し、テキストエリアを検出したら変換ボタンを追加
const observer = new MutationObserver((mutations) => {
  const textAreas = document.querySelectorAll('textarea.js-comment-field');
  textAreas.forEach(textArea => {
    if (!textArea.dataset.imageFormatterAttached) {
      addFormatButton(textArea);
      textArea.dataset.imageFormatterAttached = "true";
    }
  });
});

// ページ全体の変更を監視
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// 初期ロード時にも実行
document.addEventListener('DOMContentLoaded', () => {
  const textAreas = document.querySelectorAll('textarea.js-comment-field');
  textAreas.forEach(textArea => {
    addFormatButton(textArea);
    textArea.dataset.imageFormatterAttached = "true";
  });
});

/**
 * テキストエリアの近くに変換ボタンを追加
 * @param {HTMLTextAreaElement} textArea - 対象のテキストエリア
 */
function addFormatButton(textArea) {
  // 既存のmarka-toolbar要素を探す（GitHubのマークダウンツールバー）
  let toolbarArea = textArea.closest('.form-actions')?.querySelector('.markdown-toolbar');
  
  // ツールバーが見つからない場合は、別の場所を探す
  if (!toolbarArea) {
    toolbarArea = textArea.closest('.comment-form-wrapper')?.querySelector('.markdown-toolbar');
  }
  
  // それでも見つからない場合は、独自のコンテナを作成
  if (!toolbarArea) {
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'image-formatter-container';
    buttonContainer.style.margin = '5px 0';
    
    // ボタンを作成
    const formatButton = document.createElement('button');
    formatButton.innerText = '選択範囲の画像/動画を整形';
    formatButton.className = 'btn btn-sm';
    formatButton.style.marginRight = '5px';
    formatButton.type = 'button'; // 明示的にbutton型を指定して送信を防止
    
    // ボタンクリック時の処理
    formatButton.addEventListener('click', (event) => {
      // デフォルトの送信動作を防止
      event.preventDefault();
      event.stopPropagation();
      
      // 選択範囲を取得
      const start = textArea.selectionStart;
      const end = textArea.selectionEnd;
      
      // 選択範囲がある場合のみ処理
      if (start !== end) {
        const fullText = textArea.value;
        const selectedText = fullText.substring(start, end);
        const formattedSelection = formatImageMarkdown(selectedText);
        
        // 選択範囲を整形したテキストで置き換え
        textArea.value = fullText.substring(0, start) + formattedSelection + fullText.substring(end);
        
        // 選択状態を維持（整形後のテキスト長に合わせて）
        textArea.selectionStart = start;
        textArea.selectionEnd = start + formattedSelection.length;
      } else {
        // 選択範囲がない場合はアラート表示
        alert('テキストを選択してから「選択範囲の画像/動画を整形」ボタンを押してください。');
      }
      
      // フォーカスをテキストエリアに戻す
      textArea.focus();
      
      return false;
    });
    
    // ボタンを親要素に追加
    buttonContainer.appendChild(formatButton);
    
    // テキストエリアの後に挿入
    textArea.parentNode.insertBefore(buttonContainer, textArea.nextSibling);
  } else {
    // 既存のツールバーにボタンを追加
    const formatButton = document.createElement('button');
    formatButton.className = 'toolbar-item btn-octicon';
    formatButton.type = 'button';
    formatButton.style.marginLeft = '5px';
    
    // GitHubスタイルのアイコンを追加
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
    
    // ヒントテキストを追加
    formatButton.setAttribute('title', '選択範囲の画像/動画を整形');
    formatButton.setAttribute('aria-label', '選択範囲の画像/動画を整形');
    
    // ボタンクリック時の処理
    formatButton.addEventListener('click', (event) => {
      // デフォルトの送信動作を防止
      event.preventDefault();
      event.stopPropagation();
      
      // 選択範囲を取得
      const start = textArea.selectionStart;
      const end = textArea.selectionEnd;
      
      // 選択範囲がある場合のみ処理
      if (start !== end) {
        const fullText = textArea.value;
        const selectedText = fullText.substring(start, end);
        const formattedSelection = formatImageMarkdown(selectedText);
        
        // 選択範囲を整形したテキストで置き換え
        textArea.value = fullText.substring(0, start) + formattedSelection + fullText.substring(end);
        
        // 選択状態を維持（整形後のテキスト長に合わせて）
        textArea.selectionStart = start;
        textArea.selectionEnd = start + formattedSelection.length;
        
        // テキストエリアのHTMLイベントを発火して、GitHubのプレビューを更新
        const inputEvent = new Event('input', { bubbles: true });
        textArea.dispatchEvent(inputEvent);
      } else {
        // 選択範囲がない場合はアラート表示
        alert('テキストを選択してから「選択範囲の画像/動画を整形」ボタンを押してください。');
      }
      
      // フォーカスをテキストエリアに戻す
      textArea.focus();
      
      return false;
    });
    
    // ツールバーの末尾にボタンを追加
    toolbarArea.appendChild(formatButton);
  }
}

/**
 * テキスト内の画像と動画のMarkdownを変換
 * @param {string} text - 変換対象のテキスト
 * @returns {string} - 変換後のテキスト
 */
function formatImageMarkdown(text) {
  // 画像Markdownを検出する正規表現
  const imageMarkdownRegex = /!\[(.*?)\]\((.*?)\)/g;
  // GitHubアセットURLを検出する正規表現
  const githubAssetUrlRegex = /(https:\/\/github\.com\/user-attachments\/assets\/[a-zA-Z0-9-]+)/g;
  
  // テキスト内のメディア要素を格納する配列
  const mediaElements = [];
  
  // メディアURLを追跡するためのセット
  const processedUrls = new Set();
  
  // まず、Markdown形式の画像を探す - これらは画像として扱う
  let imageMatch;
  while ((imageMatch = imageMarkdownRegex.exec(text)) !== null) {
    const fullMatch = imageMatch[0];
    const altText = imageMatch[1];
    const url = imageMatch[2];
    
    // URLを処理済みとしてマーク
    processedUrls.add(url);
    
    mediaElements.push({
      fullMatch: fullMatch,
      altText: altText,
      url: url,
      type: 'image'
    });
  }
  
  // 次に、単体のURLを探す - これらは動画として扱う
  // (但し、既に画像として処理したURLは除外)
  let urlMatch;
  while ((urlMatch = githubAssetUrlRegex.exec(text)) !== null) {
    const url = urlMatch[0];
    
    // URLが既にMarkdown内で処理されていないか確認
    // また、URL自体がより大きなMarkdown構文の一部ではないことを確認
    if (!processedUrls.has(url) && !text.includes(`![`+url) && !text.includes(`](${url})`)) {
      // 前後のテキストを確認して、このURLが単独で存在することを確認
      const urlStart = text.indexOf(url);
      const urlEnd = urlStart + url.length;
      const prevChar = urlStart > 0 ? text[urlStart - 1] : '';
      const nextChar = urlEnd < text.length ? text[urlEnd] : '';
      
      // URLが単独のものかチェック (スペース、改行、または文の終わりに囲まれている)
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
  
  // メディアの数に応じて変換処理
  let formattedText = text;
  
  if (mediaElements.length === 1) {
    // 1つのメディア要素の場合
    const media = mediaElements[0];
    if (media.type === 'image') {
      // 画像 → <img src="..." width="300"> に変換
      formattedText = formattedText.replace(
        media.fullMatch,
        `<img src="${media.url}" width="300" alt="${media.altText}">`
      );
    } else if (media.type === 'video') {
      // 動画 → <video> タグに変換
      formattedText = formattedText.replace(
        media.fullMatch,
        `<video src="${media.url}" width="400" height="auto" controls></video>`
      );
    }
  } else if (mediaElements.length === 2) {
    // 2つのメディア要素 → 2列テーブル (1行2列) に変換
    let tableHtml = '<table><tr>\n';
    
    // 一時的に元のテキストを保存
    const originalText = formattedText;
    formattedText = '';
    
    mediaElements.forEach(media => {
      if (media.type === 'image') {
        tableHtml += `  <td><img src="${media.url}" width="300" alt="${media.altText}"></td>\n`;
      } else if (media.type === 'video') {
        tableHtml += `  <td><video src="${media.url}" width="300" height="auto" controls></video></td>\n`;
      }
      // この処理は不要（後で一括処理するため）
    });
    
    tableHtml += '</tr></table>\n\n';
    
    // メディア要素を削除した後のテキストを保持するための新しい文字列
    let cleanedText = originalText;
    
    // 各メディア要素のfullMatchを順に置換していく
    mediaElements.forEach(media => {
      cleanedText = cleanedText.replace(media.fullMatch, '');
    });
    
    formattedText = tableHtml + cleanedText.trim();
  } else if (mediaElements.length === 3) {
    // 3つのメディア要素 → 3列テーブル (1行3列) に変換
    let tableHtml = '<table><tr>\n';
    
    // 一時的に元のテキストを保存
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
    
    // メディア要素を削除した後のテキストを保持するための新しい文字列
    let cleanedText = originalText;
    
    // 各メディア要素のfullMatchを順に置換していく
    mediaElements.forEach(media => {
      cleanedText = cleanedText.replace(media.fullMatch, '');
    });
    
    formattedText = tableHtml + cleanedText.trim();
  } else if (mediaElements.length >= 4) {
    // 4つ以上のメディア要素の場合はエラーメッセージを表示
    alert('4つ以上のメディア要素(画像/動画)は変換できません。3つ以下にしてください。');
  }
  
  return formattedText;
}

/**
 * テストの実行に使用する関数
 * @param {string} input - テスト入力
 * @param {string} expectedOutput - 期待される出力
 * @param {string} description - テストの説明
 * @returns {boolean} - テストが成功したかどうか
 */
function runTest(input, expectedOutput, description) {
  const output = formatImageMarkdown(input);
  const success = output === expectedOutput;
  
  console.log(`テスト: ${description}`);
  console.log(`入力: ${input}`);
  console.log(`出力: ${output}`);
  console.log(`期待出力: ${expectedOutput}`);
  console.log(`結果: ${success ? '成功 ✅' : '失敗 ❌'}`);
  
  return success;
}

/**
 * テストケースを実行する関数
 */
function runTests() {
  // テストケース1: 単一の画像
  const test1 = {
    input: '![Simulator Screenshot](https://github.com/user-attachments/assets/3a167be4-81d1-4c0d-9c5c-db53e8cd6dd4)',
    expected: '<img src="https://github.com/user-attachments/assets/3a167be4-81d1-4c0d-9c5c-db53e8cd6dd4" width="300" alt="Simulator Screenshot">',
    description: '単一の画像が正しく変換される'
  };
  
  // テストケース2: 単一の動画
  const test2 = {
    input: 'https://github.com/user-attachments/assets/463db957-cd5e-4679-b1f2-ccd6e4f1433e',
    expected: '<video src="https://github.com/user-attachments/assets/463db957-cd5e-4679-b1f2-ccd6e4f1433e" width="400" height="auto" controls></video>',
    description: '単一の動画が正しく変換される'
  };
  
  // テストケース3: 画像と動画の組み合わせ
  const test3 = {
    input: '![画像](https://github.com/user-attachments/assets/abcd1234)\n\nhttps://github.com/user-attachments/assets/efgh5678',
    expected: '<table><tr>\n  <td><img src="https://github.com/user-attachments/assets/abcd1234" width="300" alt="画像"></td>\n  <td><video src="https://github.com/user-attachments/assets/efgh5678" width="300" height="auto" controls></video></td>\n</tr></table>\n\n',
    description: '画像と動画が正しくテーブルに変換される'
  };
  
  // テストケースの実行
  const results = [
    runTest(test1.input, test1.expected, test1.description),
    runTest(test2.input, test2.expected, test2.description),
    runTest(test3.input, test3.expected, test3.description)
  ];
  
  // 総合結果の表示
  const totalTests = results.length;
  const passedTests = results.filter(r => r).length;
  
  console.log(`\n=====================================`);
  console.log(`テスト結果: ${passedTests}/${totalTests} 成功`);
  console.log(`=====================================`);
}

// コンソールから手動でテストを実行できるようにエクスポート
if (typeof window !== 'undefined') {
  window.runMediaFormatterTests = runTests;
}