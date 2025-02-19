// キャンバスサイズ
const canvasWidth  = 1000;
const canvasHeight = 1200;
const canvasDiameter = (canvasWidth <= canvasHeight) ? canvasWidth : canvasHeight;// 最小幅
const canvasPadding = 100;

const DodaiWidth  = canvasWidth - canvasPadding*2;
const DodaiHeight = canvasHeight - canvasPadding*2;
const DodaiDiameter = (DodaiWidth <= DodaiHeight) ? DodaiWidth : DodaiHeight;// 最小幅

// ピンのデザイン
const radiusSize = 20; // 円サイズ
const lineWidth  = 20; // 線の太さ

const arrColor = {
    0:"#000",
    1:"#CCC",
    2:"#000",
    3:"#FFAA00",
    4:"#228822",
    5:"#000088",
};

// 50音母音対応
const arrAiueo = {
    'ん':0,
    'あ':1, 'か':1, 'さ':1, 'た':1, 'な':1, 'は':1, 'ま':1, 'や':1, 'ら':1, 'わ':1, 'が':1, 'ざ':1, 'だ':1, 'ば':1, 'ぱ':1,
    'い':2, 'き':2, 'し':2, 'ち':2, 'に':2, 'ひ':2, 'み':2, 'り':2, 'ぎ':2, 'じ':2, 'ぢ':2, 'び':2, 'ぴ':2,
    'う':3, 'く':3, 'す':3, 'つ':3, 'ぬ':3, 'ふ':3, 'む':3, 'ゆ':3, 'る':3, 'ぐ':3, 'ず':3, 'づ':3, 'ぶ':3, 'ぷ':3,
    'え':4, 'け':4, 'せ':4, 'て':4, 'ね':4, 'へ':4, 'め':4, 'れ':4, 'げ':4, 'ぜ':4, 'で':4, 'べ':4, 'ぺ':4,
    'お':5, 'こ':5, 'そ':5, 'と':5, 'の':5, 'ほ':5, 'も':5, 'よ':5, 'ろ':5, 'を':5, 'ご':5, 'ぞ':5, 'ど':5, 'ぼ':5, 'ぽ':5,
};

window.onload = function(){
    document.getElementById("pinTextInput").oninput = function(){
        var pinTextInput = document.getElementById('pinTextInput').value; // 魔術基盤の文言

        const pinPattern = /[^ぁ-んァ-ヶ]/g;
        pinTextInput      = pinTextInput.replace(pinPattern, ''); // ひらがなカタカナのみ有効(長音不可)
        pinTextInput      = pinTextInput.replace(/[\u30a1-\u30f6]/g, function(match) {
            var chr = match.charCodeAt(0) - 0x60;
            return String.fromCharCode(chr); // カタカナをひらがなに変換
        });
        pinTextInput = pinTextInput.replace(/ぁ/g, 'あ').replace(/ぃ/g, 'い').replace(/ぅ/g, 'う').replace(/ぇ/g, 'え').replace(/ぉ/g, 'お')
        .replace(/っ/g, 'つ').replace(/ゃ/g, 'や').replace(/ゅ/g, 'ゆ').replace(/ょ/g, 'よ')
        document.getElementById('pinText').value = pinTextInput;
    }
}

/**
 * 基盤描画
 *
 */
function getCanvas(){
    const canvas = document.getElementById('kiban');

    var kibanName    = document.getElementById('kibanName').value; // 魔術基盤名
    var pinText      = document.getElementById('pinText').value; // 魔術基盤の文言
    kibanName = (kibanName != '') ? '・'+kibanName+'・' : '';

    // canvas取得無効 または 魔術基盤文言の文字数が0
    if (canvas.getContext == null || pinText.length < 1) {
        return;
    }

    const ctx = canvas.getContext("2d");

    setDodai(canvas, ctx);
    setKibanInfo(canvas, ctx, kibanName, pinText);
    var arrPinInfo = getArrPinInfo(pinText);
    setPin(canvas, ctx, pinText, arrPinInfo);

}


/**
 * 基盤土台部分の円描画
 *
 * @param canvas
 * @param ctx
 */
function setDodai(canvas, ctx){
    ctx.clearRect(0, 0, canvas.width, canvas.height); // 初期化
    const lineWidth = 2;

    //背景
    ctx.fillStyle = "#FFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // context.arc(X座標, Y座標, 半径, 描画開始角度, 描画終了角度, 反時計回り描画有無);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.arc(canvasDiameter/2, canvasDiameter/2, DodaiDiameter/2-lineWidth, 0, Math.PI * 2, true);
    ctx.stroke();
}


/**
 * 基盤名・文言の描画
 *
 * @param canvas
 * @param ctx
 * @param kibanName
 * @param pinText
 */
function setKibanInfo(canvas, ctx, kibanName, pinText){
    const kibanFontSize = 72;
    const pinFontSize   = 48;

    ctx.textAlign = "center";
    // 基盤名の描画
    ctx.beginPath();
    ctx.font = kibanFontSize+"px Arial";
    ctx.fillStyle = "#000";
    ctx.fillText(kibanName, canvasDiameter/2, canvasHeight-pinFontSize-kibanFontSize-4-canvasPadding/2);

    // 文言の描画
    ctx.beginPath();
    ctx.font = pinFontSize+"px 魔術言語";
    ctx.fillStyle = "#622d18";
    ctx.fillText(pinText, canvasDiameter/2, canvasHeight-pinFontSize-canvasPadding/2);
}


/**
 * ピンの情報
 *
 */
function getArrPinInfo(pinText){
    var arrPinInfo = pinText.split('');

    const textLimit   = (pinText.length > 10) ? 8 : 10;// 1行あたりの最大ピン数
    const adjustment  = (pinText.length > 10) ? DodaiWidth/10 * 3/2 : DodaiWidth/10 * 1/2; // 余白微調整用
    const rowCountMax = Math.ceil(pinText.length/textLimit); // 端数切り上げ
    const yStart      = canvasDiameter/2 + rowCountMax/2 * canvasDiameter/10; // Y軸基準（中心から全行の半分ずらす）

    var rowCount = 1;
    for (let i =0; i < pinText.length; i++) {
        // ピンが中途半端な数の場合余白調整を入れる処理
        const xStart = (rowCountMax == rowCount)
            ? DodaiWidth/10 * (textLimit*rowCountMax - pinText.length) /2 + adjustment + canvasPadding
            : DodaiWidth/10 * 3/2 + canvasPadding;
        const x = DodaiWidth/10*(i- textLimit*(rowCount-1)) + xStart;
        const y = yStart - canvasWidth/10*(rowCountMax-rowCount) * 1.6;
        arrPinInfo[i] = {
            'id' : i ,
            'name' : arrPinInfo[i],
            'boin' : arrAiueo[arrPinInfo[i]],
            'x' : x,
            'y' : y };

        if (textLimit*rowCount-1 <= i) {
            rowCount++;
        }

    }

    return arrPinInfo;
}

/**
 * ピンの描画
 *
 * @param canvas
 * @param ctx
 * @param pinText
 */
function setPin(canvas, ctx, pinText, arrPinInfo){
    ctx.lineWidth = lineWidth;

    for (let i =0; i < pinText.length; i++) {
        ctx.beginPath();
        ctx.strokeStyle = arrColor[arrPinInfo[i]['boin']];
        ctx.arc(arrPinInfo[i]['x'], arrPinInfo[i]['y'], radiusSize, 0, Math.PI * 2, true);
        ctx.stroke();

        ctx.beginPath();
        ctx.font = "50px 魔術言語";
        ctx.fillStyle = "#622d18";
        ctx.fillText(arrPinInfo[i]['name'], arrPinInfo[i]['x'], arrPinInfo[i]['y']-radiusSize*2);
    }

}


// https://allabout.co.jp/gm/gc/23854/


/**
 * 画像ダウンロード
 *
 */
function downloadCanvas() {
    const canvas = document.getElementById('kiban');
    let link     = document.getElementById('hiddenLink');
    link.href    = canvas.toDataURL();

    document.getElementById('canvasImage').src = canvas.toDataURL();
    link.click();
}

