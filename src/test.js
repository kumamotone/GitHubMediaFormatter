// GitHub Media Formatter のテストスクリプト
// Node.js 環境で実行するためのテストファイル

// 元のコードから formatImageMarkdown 関数を抽出・移植
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
    // 4つ以上のメディア要素の場合は特に何もしない（実際にはアラートが表示されるが、テスト環境では省略）
    console.log('4つ以上のメディア要素は変換できません');
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
  console.log('GitHub Media Formatter テスト開始\n');
  
  // ベーシックケース
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
  
  // 画像のみの組み合わせ
  // テストケース3: 画像2個
  const test3 = {
    input: '![画像1](https://github.com/user-attachments/assets/img1)\n\n![画像2](https://github.com/user-attachments/assets/img2)',
    expected: '<table><tr>\n  <td><img src="https://github.com/user-attachments/assets/img1" width="300" alt="画像1"></td>\n  <td><img src="https://github.com/user-attachments/assets/img2" width="300" alt="画像2"></td>\n</tr></table>\n\n',
    description: '画像2個が正しくテーブルに変換される'
  };
  
  // テストケース4: 画像3個
  const test4 = {
    input: '![画像1](https://github.com/user-attachments/assets/img1)\n\n![画像2](https://github.com/user-attachments/assets/img2)\n\n![画像3](https://github.com/user-attachments/assets/img3)',
    expected: '<table><tr>\n  <td><img src="https://github.com/user-attachments/assets/img1" width="300" alt="画像1"></td>\n  <td><img src="https://github.com/user-attachments/assets/img2" width="300" alt="画像2"></td>\n  <td><img src="https://github.com/user-attachments/assets/img3" width="300" alt="画像3"></td>\n</tr></table>\n\n',
    description: '画像3個が正しくテーブルに変換される'
  };
  
  // 動画のみの組み合わせ
  // テストケース5: 動画2個
  const test5 = {
    input: 'https://github.com/user-attachments/assets/video1\n\nhttps://github.com/user-attachments/assets/video2',
    expected: '<table><tr>\n  <td><video src="https://github.com/user-attachments/assets/video1" width="300" height="auto" controls></video></td>\n  <td><video src="https://github.com/user-attachments/assets/video2" width="300" height="auto" controls></video></td>\n</tr></table>\n\n',
    description: '動画2個が正しくテーブルに変換される'
  };
  
  // テストケース6: 動画3個
  const test6 = {
    input: 'https://github.com/user-attachments/assets/video1\n\nhttps://github.com/user-attachments/assets/video2\n\nhttps://github.com/user-attachments/assets/video3',
    expected: '<table><tr>\n  <td><video src="https://github.com/user-attachments/assets/video1" width="300" height="auto" controls></video></td>\n  <td><video src="https://github.com/user-attachments/assets/video2" width="300" height="auto" controls></video></td>\n  <td><video src="https://github.com/user-attachments/assets/video3" width="300" height="auto" controls></video></td>\n</tr></table>\n\n',
    description: '動画3個が正しくテーブルに変換される'
  };
  
  // 画像と動画の組み合わせ
  // テストケース7: 画像1個と動画1個
  const test7 = {
    input: '![画像](https://github.com/user-attachments/assets/img)\n\nhttps://github.com/user-attachments/assets/video',
    expected: '<table><tr>\n  <td><img src="https://github.com/user-attachments/assets/img" width="300" alt="画像"></td>\n  <td><video src="https://github.com/user-attachments/assets/video" width="300" height="auto" controls></video></td>\n</tr></table>\n\n',
    description: '画像1個と動画1個が正しくテーブルに変換される'
  };
  
  // テストケース8: 画像2個と動画1個
  const test8 = {
    input: '![画像1](https://github.com/user-attachments/assets/img1)\n\n![画像2](https://github.com/user-attachments/assets/img2)\n\nhttps://github.com/user-attachments/assets/video',
    expected: '<table><tr>\n  <td><img src="https://github.com/user-attachments/assets/img1" width="300" alt="画像1"></td>\n  <td><img src="https://github.com/user-attachments/assets/img2" width="300" alt="画像2"></td>\n  <td><video src="https://github.com/user-attachments/assets/video" width="300" height="auto" controls></video></td>\n</tr></table>\n\n',
    description: '画像2個と動画1個が正しくテーブルに変換される'
  };
  
  // テストケース9: 画像1個と動画2個
  const test9 = {
    input: '![画像](https://github.com/user-attachments/assets/img)\n\nhttps://github.com/user-attachments/assets/video1\n\nhttps://github.com/user-attachments/assets/video2',
    expected: '<table><tr>\n  <td><img src="https://github.com/user-attachments/assets/img" width="300" alt="画像"></td>\n  <td><video src="https://github.com/user-attachments/assets/video1" width="300" height="auto" controls></video></td>\n  <td><video src="https://github.com/user-attachments/assets/video2" width="300" height="auto" controls></video></td>\n</tr></table>\n\n',
    description: '画像1個と動画2個が正しくテーブルに変換される'
  };
  
  // 指定のテストケース
  // テストケース10: 特定のテストケース
  const test10 = {
    input: '![Simulator Screenshot - iPhone 15 Pro - 2025-03-17 at 20 48 31](https://github.com/user-attachments/assets/3a167be4-81d1-4c0d-9c5c-db53e8cd6dd4)',
    expected: '<img src="https://github.com/user-attachments/assets/3a167be4-81d1-4c0d-9c5c-db53e8cd6dd4" width="300" alt="Simulator Screenshot - iPhone 15 Pro - 2025-03-17 at 20 48 31">',
    description: '指定のテストケース'
  };
  
  // テストケースの実行
  const results = [
    runTest(test1.input, test1.expected, test1.description),
    runTest(test2.input, test2.expected, test2.description),
    runTest(test3.input, test3.expected, test3.description),
    runTest(test4.input, test4.expected, test4.description),
    runTest(test5.input, test5.expected, test5.description),
    runTest(test6.input, test6.expected, test6.description),
    runTest(test7.input, test7.expected, test7.description),
    runTest(test8.input, test8.expected, test8.description),
    runTest(test9.input, test9.expected, test9.description),
    runTest(test10.input, test10.expected, test10.description)
  ];
  
  // 総合結果の表示
  const totalTests = results.length;
  const passedTests = results.filter(r => r).length;
  
  console.log(`\n=====================================`);
  console.log(`テスト結果: ${passedTests}/${totalTests} 成功`);
  console.log(`=====================================`);
  
  // 終了コードを設定（すべてのテストが成功した場合は0、そうでない場合は1）
  process.exit(passedTests === totalTests ? 0 : 1);
}

// テストを実行
runTests();