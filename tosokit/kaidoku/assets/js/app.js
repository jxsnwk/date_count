
// todo ローカル保存する値をmomoとkibanでわけたい！

// pagesDataはmomotaro.js/kiban.jsで定義済み

document.addEventListener('DOMContentLoaded', () => {
  loadKanaSelectors();       // 50音チェックボックスのUIを作成
  generatePages();           // JSON直埋め込みの場合のみ必要。ページ表示のDOMを生成
  loadAll();                 // ローカルストレージから保存データを復元
  updateAllFurigana();       // チェックされた文字に基づきふりがなを更新
});

// JSONをページごとに生成（本文・ふりがな・入力欄を縦揃え）
function generatePages() {
  const container = document.getElementById('allPages');
  container.innerHTML = '';
  // --- ローカルストレージのデータを取得 ---
  const savedData = JSON.parse(localStorage.getItem(pageKey) || '{}');
  const savedPages = savedData.pages || [];

  pagesData.forEach(({ page, text, image, pass }) => {
    // 表示フラグの確認
    const savedPage = savedPages.find(p => p.page === page);
    const viewFlg = (savedPage?.viewPass === pass) ? "1" : "0";

    const div = document.createElement('div');
    div.className = 'page-container';
    div.id = `page_${page}`;
    div.style.display = usePass ? ((viewFlg == 0) ? 'none' : 'block') : 'block';
    const lines = text.split('\n');

    // 各行ごとに、ふりがな行・本文行・翻訳入力欄を生成
    const contentHtml = lines.map((line, i) => {
      // 空行用処理（空白ブロックでスペース確保）
      if (line.trim() === '') {
        return `<br><br>`;
      }

      // ふりがな行は1文字ずつスペース（全角スペース）で初期化
      const furiganaSpans = [...line].map(ch => `<span data-char="${ch}">　</span>`).join('');
      // 本文は1文字ずつspanに分割して表示
      const originalSpans = [...line].map(ch => `<span>${ch}</span>`).join('');

      return `
        <div class="line-group">
          <div id="furiganaLine_${page}_${i}" class="line-furigana">${furiganaSpans}</div>
          <div class="line-original custom-font">${originalSpans}</div>
          <input type="text" id="translation_${page}_${i}" class="line-translation" />
        </div>
      `;
    }).join('');

    // 画像があれば挿入（ページ横のカラム）
    const contentImage = (image) ? `<img src="${image}" alt="Page ${page} Image" />` : '';

    // 表示/非表示
    const contentPass = (usePass) ? `<div id="viewPass_${page}" data-viewflg="${viewFlg}" data-viewpass="${pass}"></div>` : '';

    div.innerHTML = `
      <h3>${page}</h3>
      <div class="columns">
        <div class="column">
          ${contentImage}
        </div>
        <div class="column">
          ${contentHtml}
        </div>
        <div class="column">
          <textarea id="memo_${page}" class="memo-area" placeholder="メモ"></textarea>
          ${contentPass}
        </div>
      </div>
    `;
    container.appendChild(div);
  });
}

// メッセージ表示
function showToast(message, duration = 2000) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');

  // 消すタイマー
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.style.display = 'none';
    }, 200); // フェードアウト完了後に非表示
  }, duration);

  // 一瞬 display:block にする（必要）
  toast.style.display = 'block';
}

