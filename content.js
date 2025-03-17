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
    formatButton.innerText = '選択範囲の画像を整形';
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
        alert('テキストを選択してから「選択範囲の画像を整形」ボタンを押してください。');
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
    formatButton.setAttribute('title', '選択範囲の画像を整形');
    formatButton.setAttribute('aria-label', '選択範囲の画像を整形');
    
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
        alert('テキストを選択してから「選択範囲の画像を整形」ボタンを押してください。');
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
 * テキスト内の画像Markdownを変換
 * @param {string} text - 変換対象のテキスト
 * @returns {string} - 変換後のテキスト
 */
function formatImageMarkdown(text) {
  // 画像Markdownを検出する正規表現
  const imageRegex = /!\[(.*?)\]\((.*?)\)/g;
  
  // テキスト内の画像Markdownをすべて抽出
  const images = [];
  let match;
  while ((match = imageRegex.exec(text)) !== null) {
    images.push({
      fullMatch: match[0],
      altText: match[1],
      url: match[2]
    });
  }
  
  // 画像の数に応じて変換処理
  let formattedText = text;
  
  if (images.length === 1) {
    // 1枚の画像 → <img src="..." width="300"> に変換
    const img = images[0];
    formattedText = formattedText.replace(
      img.fullMatch,
      `<img src="${img.url}" width="300" alt="${img.altText}">`
    );
  } else if (images.length === 2) {
    // 2枚の画像 → 2列テーブル (1行2列) に変換
    let tableHtml = '<table><tr>\n';
    
    images.forEach(img => {
      tableHtml += `  <td><img src="${img.url}" alt="${img.altText}"></td>\n`;
      formattedText = formattedText.replace(img.fullMatch, '');
    });
    
    tableHtml += '</tr></table>\n\n';
    formattedText = tableHtml + formattedText.trim();
  } else if (images.length === 3) {
    // 3枚の画像 → 3列テーブル (1行3列) に変換
    let tableHtml = '<table><tr>\n';
    
    images.forEach(img => {
      tableHtml += `  <td><img src="${img.url}" alt="${img.altText}"></td>\n`;
      formattedText = formattedText.replace(img.fullMatch, '');
    });
    
    tableHtml += '</tr></table>\n\n';
    formattedText = tableHtml + formattedText.trim();
  } else if (images.length >= 4) {
    // 4枚以上の画像の場合はエラーメッセージを表示
    alert('4枚以上の画像は変換できません。3枚以下にしてください。');
  }
  
  return formattedText;
}