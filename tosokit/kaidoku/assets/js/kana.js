
const pageKey = `translationData_${location.pathname.split('/').pop().replace(/\.[^/.]+$/, '') || 'index'}`;
const kanaKey = 'translationData_kanaChecked'; // 共通キー

// 50音表

// 50音チェックボックスのUIを作成
function loadKanaSelectors(mode = 'all') {
    const kanaArea = document.getElementById('kanaSelectors');
    kanaArea.innerHTML = '';
    // kanaArea.style.display = 'inline-block';
    kanaArea.style.display = 'none'; // 現状非表示設定
    kanaArea.style.fontSize = '16px';
    kanaArea.style.lineHeight = '1.4em';
    kanaArea.style.border = '1px solid #ddd';
    kanaArea.style.padding = '10px';
    kanaArea.style.whiteSpace = 'pre';

    const storedKana = JSON.parse(localStorage.getItem(kanaKey) || '{}');
    const checkedKana = new Set(storedKana.kanaChecked || []);

    // ヘッダー：列ヘッダー（上の行）
    const colHeaders = ['ぱ', 'ば', 'だ', 'ざ', 'が', 'ん', 'わ', 'ら', 'や', 'ま', 'は', 'な', 'た', 'さ', 'か', 'あ'];
    // 行ヘッダー（右端の列）
    const rowHeaders = ['あ', 'い', 'う', 'え', 'お'];

    // 文字行（チェック対象のみ）
    const lines = [
        'ぱばだざがんわらやまはなたさかあ',
        'ぴびぢじぎ　　り　みひにちしきい',
        'ぷぶづずぐ　　るゆむふぬつすくう',
        'ぺべでぜげ　　れ　めへねてせけえ',
        'ぽぼどぞご　をろよもほのとそこお'
    ];

    const table = document.createElement('table');
    table.style.borderCollapse = 'collapse';

    // ヘッダー行を作成（列ヘッダー＋右端空セル）
    const thead = document.createElement('thead');
    const trHead = document.createElement('tr');

    // 列ヘッダーセルを全て作る
    colHeaders.forEach(ch => {
        const th = document.createElement('th');
        th.style.border = '1px solid #ccc';
        th.style.padding = '4px 6px';
        th.style.textAlign = 'center';
        th.style.backgroundColor = '#e0e0e0';
        th.textContent = ch;
        trHead.appendChild(th);
    });

    // 一番右端のヘッダー行の空セル（行ヘッダーの列ヘッダー部分）
    const emptyTh = document.createElement('th');
    emptyTh.style.border = '1px solid #ccc';
    emptyTh.style.padding = '4px 6px';
    trHead.appendChild(emptyTh);

    thead.appendChild(trHead);
    table.appendChild(thead);

    // tbody部分（文字セル + 行ヘッダー（右端））
    const tbody = document.createElement('tbody');

    lines.forEach((line, rowIndex) => {
        const tr = document.createElement('tr');

        // 文字セル（左から右に並べる）
        for (let colIndex = 0; colIndex < colHeaders.length; colIndex++) {
            const char = line[colIndex] || '　'; // 全角スペースで空白埋め

            const td = document.createElement('td');
            td.style.border = '1px solid #ccc';
            td.style.padding = '4px 6px';
            td.style.textAlign = 'center';

            if (char === '　' || char === ' ') {
                td.innerHTML = '&nbsp;';
                td.style.backgroundColor = '#f0f0f0';
            } else if (mode === 'checkedOnly') {
                td.style.fontSize = "1.5rem";
                td.style.width = "1.5rem";
                td.style.height = "1.5rem";
                if (checkedKana.has(char)) {
                    td.textContent = char;
                    td.style.fontFamily = "魔術言語";
                } else {
                    td.innerHTML = '&nbsp;';
                }
            } else {
                const label = document.createElement('label');
                label.style.cursor = 'pointer';
                const input = document.createElement('input');
                input.type = 'checkbox';
                input.value = char;
                input.className = 'kana-checkbox';
                input.addEventListener('change', updateAllFurigana);

                label.appendChild(input);
                label.appendChild(document.createTextNode(char));
                td.appendChild(label);
            }

            tr.appendChild(td);
        }

        // 行ヘッダー（右端に追加）
        const thRow = document.createElement('th');
        thRow.style.border = '1px solid #ccc';
        thRow.style.padding = '4px 6px';
        thRow.style.textAlign = 'center';
        thRow.style.backgroundColor = '#f0f8ff';
        thRow.textContent = rowHeaders[rowIndex] || '';
        tr.appendChild(thRow);

        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    kanaArea.appendChild(table);

}

// function loadKanaSelectors() {
//     const kanaArea = document.getElementById('kanaSelectors');
//     kanaArea.innerHTML = '';
//     // kanaArea.style.display = 'inline-block';
//     kanaArea.style.display = 'none'; // 現状非表示設定
//     kanaArea.style.fontSize = '16px';
//     kanaArea.style.lineHeight = '1.4em';
//     kanaArea.style.border = '1px solid #ddd';
//     kanaArea.style.padding = '10px';
//     kanaArea.style.whiteSpace = 'pre';

//     // 五十音の行ごとの文字列（空白は非選択スペース）
//     const lines = [
//         'ぱばだざがんわらやまはなたさかあ',
//         'ぴびぢじぎ　　り　みひにちしきい',
//         'ぷぶづずぐ　　るゆむふぬつすくう',
//         'ぺべでぜげ　　れ　めへねてせけえ',
//         'ぽぼどぞご　をろよもほのとそこお'
//     ];

//     // テーブルで整列させて表示
//     const table = document.createElement('table');
//     table.style.borderCollapse = 'collapse';

//     lines.forEach(line => {
//         const tr = document.createElement('tr');
//         for (let char of line) {
//             const td = document.createElement('td');
//             td.style.border = '1px solid #ccc';
//             td.style.padding = '4px 6px';
//             td.style.textAlign = 'center';

//             // 空白部分は背景色のみ設定し、チェックボックスはなし
//             if (char === '　' || char === ' ') {
//                 td.style.backgroundColor = '#f9f9f9';
//             } else {
//                 // チェックボックスとラベルを作成し、変更時にふりがな更新をトリガー
//                 const label = document.createElement('label');
//                 label.style.cursor = 'pointer';
//                 const input = document.createElement('input');
//                 input.type = 'checkbox';
//                 input.value = char;
//                 input.className = 'kana-checkbox';
//                 input.addEventListener('change', updateAllFurigana);

//                 label.appendChild(input);
//                 label.appendChild(document.createTextNode(char));
//                 td.appendChild(label);
//             }
//             tr.appendChild(td);
//         }
//         table.appendChild(tr);
//     });

//     kanaArea.appendChild(table);
// }


function updateAllFurigana() {
    const storedKana = JSON.parse(localStorage.getItem(kanaKey) || '{}');
    const savedKana = new Set(storedKana.kanaChecked || []);
    const checkboxKana = new Set(
        Array.from(document.querySelectorAll('.kana-checkbox:checked')).map(cb => cb.value)
    );

    const checkedKana = new Set([...savedKana, ...checkboxKana]);

    pagesData.forEach(({ page, text }) => {
        const lines = text.split('\n');
        lines.forEach((line, i) => {
            const container = document.getElementById(`furiganaLine_${page}_${i}`);
            if (!container) return;

            const spans = container.querySelectorAll('span');
            spans.forEach(span => {
                const ch = span.getAttribute('data-char');
                const blank = [' ', '　', '~', '-'];

                if (checkedKana.has(ch) || blank.includes(ch)) {
                    span.textContent = ch;
                } else {
                    createFuriganaInput(span, ch);
                }

            });
        });
    });
}

// 入力欄の作成（選択中の文字以外）
function createFuriganaInput(span, char) {
    // すでにinputがあればスキップ
    if (span.querySelector('input')) return;

    const input = document.createElement('input');
    input.setAttribute('type', 'text');
    input.setAttribute('maxlength', '2');
    input.classList.add('furigana-input');
    input.dataset.char = char;

    input.addEventListener('input', () => checkFuriganaInput(input, char));

    span.innerHTML = '';
    span.appendChild(input);
}

// 入力内容をチェックし、正解なら kanaChecked に追加
function checkFuriganaInput(input, correctChar) {
    if (input.value === correctChar) {
        const kana = JSON.parse(localStorage.getItem(kanaKey) || '{}');
        const checkedKana = new Set(kana.kanaChecked || []);

        checkedKana.add(correctChar);

        localStorage.setItem(kanaKey, JSON.stringify({
            kanaChecked: Array.from(checkedKana)
        }));
        input.blur();
        showToast(`「${correctChar}」を追加しました`);
        updateAllFurigana();
    }
}


// チェックボックス状態を復元
function updatekanaChecked(kanaData = {}) {
    document.querySelectorAll('.kana-checkbox').forEach(cb => {
        cb.checked = kanaData.kanaChecked?.includes(cb.value) ?? false;
    });
    updateAllFurigana();
    saveAll();
}


