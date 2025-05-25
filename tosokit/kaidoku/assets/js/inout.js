// ローカルストレージに全保存
function saveAll() {
    const kana = {
        kanaOverwriteMode: false, // ローカルにはfalseで保存
        kanaChecked: Array.from(document.querySelectorAll('.kana-checkbox:checked')).map(cb => cb.value),
    };

    localStorage.setItem(kanaKey, JSON.stringify(kana));

    const data = {
        viewPassOverwriteMode: false, // ローカルにはfalseで保存
        pages: pagesData.map(({ page, text, pass }) => {
            const lines = text.split('\n');

            // 表示フラグの確認
            const viewPassDiv = document.getElementById(`viewPass_${page}`);
            const viewFlg = (viewPassDiv?.dataset.viewflg == "1") ? true : false;

            return {
                page,
                translationLines: lines.map((_, i) => document.getElementById(`translation_${page}_${i}`)?.value || ''),
                memo: document.getElementById(`memo_${page}`)?.value || '',
                ...(usePass ? {
                    viewPass: viewFlg ? pass : "",
                    viewFlg
                } : {})
            };
        })
    };
    localStorage.setItem(pageKey, JSON.stringify(data));
}


// ローカルストレージから復元
function loadAll() {
    // --- kanaChecked 読み込み（共通） ---
    let kanaData = JSON.parse(localStorage.getItem(kanaKey) || '[]');
    updatekanaChecked(kanaData);

    // --- 各ページデータ読み込み ---
    const saved = localStorage.getItem(pageKey);
    if (!saved) return;

    const data = JSON.parse(saved);
    // 各ページ・行ごとに翻訳入力とメモを復元
    updatePageContents(data);
}

// ストレージと画面を初期化
function clearStorage() {
    if (confirm('すべてのデータを削除しますか？')) {
        localStorage.removeItem(pageKey); // ページ別データのみ削除
        localStorage.removeItem(kanaKey);

        // グローバル変数 kanaChecked がある場合は初期化
        if (typeof kanaChecked !== 'undefined') {
            for (const key in kanaChecked) {
                delete kanaChecked[key];
            }
        }

        // 再描画
        if (typeof renderKanaSelector === 'function') {
            renderKanaSelector();
        } else {
            location.reload(); // 安全のため fallback
        }
    }
}

// JSONとして保存ダウンロード
function exportToJson() {
    saveAll(); // 念のため現在の状態を保存
    const kana = localStorage.getItem(kanaKey);
    const data = localStorage.getItem(pageKey);

    let allJson = Object.assign(JSON.parse(kana), JSON.parse(data));

    const saveData = JSON.stringify(allJson, null, 2);
    const blob = new Blob([saveData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // ▼ 日付のフォーマット作成（例: 2025-05-22）
    // const now = new Date();
    // const dateStr = now.toISOString().split('T')[0]; // "YYYY-MM-DD"
    // ▼ YYYYMMDDhhmmss 形式での日時取得
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    const dateStr = [
        now.getFullYear(),           // YYYY
        pad(now.getMonth() + 1),     // MM
        pad(now.getDate()),          // DD
        '_',
        pad(now.getHours()),         // hh
        pad(now.getMinutes()),       // mm
        pad(now.getSeconds())        // ss
    ].join('');

    // ▼ ファイル名（例: momo_20250522_114903.json）
    const pageName = location.pathname.split('/').pop().replace('.html', '') || 'page';
    const filename = `${pageName}_${dateStr}.json`;

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 外部JSONから読み込み
function loadFromFile() {
    const fileInput = document.getElementById('jsonFileInput');
    const file = fileInput.files[0];
    if (!file) {
        alert('JSONファイルを選択してください。');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
        try {
            const data = JSON.parse(event.target.result);

            // --- kanaChecked（50音チェック）の反映 ---
            let kanaData = (data.kanaOverwriteMode === true) ? data : JSON.parse(localStorage.getItem(kanaKey) || '[]');
            updatekanaChecked(kanaData);

            if (data.kanaOverwriteMode === true) {
                showToast('50音チェックを読み込みました。');
            }

            // --- 従来どおり全上書き ---
            updatePageContents(data);
            applyViewPassControl(data);
            saveAll();
            showToast('全文読み込みました。');
        } catch (err) {
            alert('JSONファイルの読み込みに失敗しました。');
            console.error(err);
        }
    };

    reader.readAsText(file);
}

// テキストエリアに貼ったJSONを読み込んで反映
function loadFromForm() {
    const textarea = document.getElementById('jsonFormInput');
    const formTxt = textarea.value.trim();
    if (!formTxt) {
        alert('JSONが空です。');
        return;
    }

    let data;
    try {
        data = JSON.parse(formTxt);
    } catch (err) {
        alert('JSONのパースに失敗しました。形式が正しいか確認してください。');
        console.error(err);
        return;
    }

    // --- kanaChecked（50音チェック）の反映 ---
    let kanaData = (data.kanaOverwriteMode === true) ? data : JSON.parse(localStorage.getItem(kanaKey) || '[]');
    updatekanaChecked(kanaData);
    // --- kanaOverwriteMode = true の場合、kanaChecked のみ上書きで終了 ---
    if (kanaData.kanaOverwriteMode === true) {
        showToast('50音チェックのみを反映しました。');
        return;
    }

    // --- 全上書きモード（従来通りの読み込み） ---
    updatePageContents(data);
    applyViewPassControl(data);

    saveAll();
    showToast('テキストエリアからの読み込みが完了しました。');
}

// JSONコピー pagesのみ
function copyToJson(mode = 'pages') {
    saveAll(); // 現在の状態を保存しておく

    // mode一致のJSON取得
    const data = getToModeJson(mode);

    // クリップボードへコピー
    navigator.clipboard.writeText(data)
        .then(() => {
            showToast('JSONをクリップボードにコピーしました。');
        })
        .catch(err => {
            console.error('コピーに失敗:', err);
            showToast('クリップボードへのコピーに失敗しました。ブラウザの制約があるかもしれません。');
        });
}

// コピー時のJSON出力フィールド調整
function getToModeJson(mode = 'pages') {
    const kana = JSON.parse(localStorage.getItem(kanaKey) || '[]');
    const data = JSON.parse(localStorage.getItem(pageKey) || '[]');

    if (mode === 'pages') {
        const fieldPages = data.pages.map(({ page, translationLines, memo, viewPass }) => ({
            page,
            translationLines,
            memo,
            viewPass
        }));
        return JSON.stringify({ pages: fieldPages }, null);
    }

    if (mode === 'kana') {
        return JSON.stringify({
            kanaOverwriteMode: true,
            kanaChecked: kana.kanaChecked
        }, null);
    }

    if (mode === 'kiban') {
        const kibanfiedPages = data.pages.map(({ page, viewPass, viewFlg }) => ({
            page,
            viewPass,
            viewFlg
        }));
        return JSON.stringify({
            viewPassOverwriteMode: true,
            pages: kibanfiedPages
        }, null);
    }
}

// 表示/非表示制御
function applyViewPassControl(data) {
    if (data.viewPassOverwriteMode === true) {
        data.pages?.forEach(({ page, viewPass }) => {
            const expectedPass = pagesData.find(p => p.page === page)?.pass;

            const pageDiv = document.getElementById(`page_${page}`);
            const viewPassDiv = document.getElementById(`viewPass_${page}`);
            if (!pageDiv) return; // ページがDOMに存在しない場合はスキップ

            if (expectedPass === viewPass) {
                pageDiv.style.display = 'block';
                viewPassDiv.dataset.viewflg = "1";
            }
        });
    }
    saveAll();
}

function updatePageContents(data) {
    data.pages?.forEach(({ page, translationLines, memo }) => {
        if (!document.getElementById(`page_${page}`)) return; // ページが存在しない場合はスキップ
        translationLines?.forEach((text, i) => {
            const t = document.getElementById(`translation_${page}_${i}`);
            if (t) t.value = text;
        });
        const m = document.getElementById(`memo_${page}`);
        if (m && typeof memo === 'string') {
            m.value = memo;
        }
    });
}
