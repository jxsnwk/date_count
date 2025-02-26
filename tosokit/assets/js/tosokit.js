// キャンバスサイズ
const canvasWidth  = 1000;
const canvasHeight = 1200;
const canvasDiameter = (canvasWidth <= canvasHeight) ? canvasWidth : canvasHeight;// 最小幅
const canvasPadding = 100;

const baseWidth  = canvasWidth - canvasPadding*2;
const baseHeight = canvasHeight - canvasPadding*2;
const baseDiameter = (baseWidth <= baseHeight) ? baseWidth : baseHeight;// 最小幅

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
        var pinTextInput = document.getElementById('pinTextInput').value; // 魔術基板の文言

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
 * 基板描画
 *
 */
function getCanvas(){
    const canvas = document.getElementById('kiban');

    var kibanName    = document.getElementById('kibanName').value; // 魔術基板名
    var pinText      = document.getElementById('pinText').value; // 魔術基板の文言
    kibanName = (kibanName != '') ? '・'+kibanName+'・' : '';

    // canvas取得無効 または 魔術基板文言の文字数が0
    if (canvas.getContext == null || pinText.length < 1) {
        return;
    }

    const ctx = canvas.getContext("2d");

    setBase(canvas, ctx);
    setKibanInfo(canvas, ctx, kibanName, pinText);
    var arrPinInfo = getArrPinInfo(pinText);
    setPin(canvas, ctx, pinText, arrPinInfo);

}


/**
 * 基板土台部分の円描画
 *
 * @param canvas
 * @param ctx
 */
function setBase(canvas, ctx){
    ctx.clearRect(0, 0, canvas.width, canvas.height); // 初期化
    const lineWidth = 2;

    //背景
    ctx.fillStyle = "#FFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const bgClear = document.getElementById('bgClear').checked; // 背景透過チェック
    if (bgClear == true) {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // 初期化
    }

    // context.arc(X座標, Y座標, 半径, 描画開始角度, 描画終了角度, 反時計回り描画有無);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.arc(canvasDiameter/2, canvasDiameter/2, baseDiameter/2-lineWidth, 0, Math.PI * 2, true);
    ctx.stroke();
}


/**
 * 基板名・文言の描画
 *
 * @param canvas
 * @param ctx
 * @param kibanName
 * @param pinText
 */
function setKibanInfo(canvas, ctx, kibanName, pinText){
    let kibanFontSize = 72;
    let pinFontSize   = 48;
    if (canvasWidth <= kibanFontSize * kibanName.length) {
        kibanFontSize = canvasWidth / kibanName.length
    }
    if (canvasWidth <= pinFontSize * pinText.length) {
        pinFontSize = canvasWidth / pinText.length
    }

    ctx.textAlign = "center";
    // 基板名の描画
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
    const pinmode = document.querySelector('#pinmode').pinmode.value; // ピンの並べ方

    if (pinmode == 'circle') {
        arrPinInfo = getCirclePin(pinText, arrPinInfo);
    } else {
        arrPinInfo = getLinePin(pinText, arrPinInfo);
    }

    return arrPinInfo;
}

/**
 * 並べ方：列
 */
function getLinePin(pinText, arrPinInfo) {
    const textLimit   = (pinText.length > 10) ? 8 : 10;// 1行あたりの最大ピン数
    const adjustment  = (pinText.length > 10) ? baseWidth/10 * 3/2 : baseWidth/10 * 1/2; // 余白微調整用
    const rowCountMax = Math.ceil(pinText.length/textLimit); // 端数切り上げ
    const yStart      = canvasDiameter/2 + rowCountMax/2 * canvasDiameter/10; // Y軸基準（中心から全行の半分ずらす）

    var rowCount = 1;
    for (let i =0; i < pinText.length; i++) {
        // ピンが中途半端な数の場合余白調整を入れる処理
        const xStart = (rowCountMax == rowCount)
            ? baseWidth/10 * (textLimit*rowCountMax - pinText.length) /2 + adjustment + canvasPadding
            : baseWidth/10 * 3/2 + canvasPadding;
        const x = baseWidth/10*(i- textLimit*(rowCount-1)) + xStart;
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
 * 並べ方：円
 */
function getCirclePin(pinText, arrPinInfo) {

     const cx = canvasDiameter/2;  // 円のx軸中心
     const cy = canvasDiameter/2 + canvasPadding/4;  // 円のy軸中心
     const h  = baseDiameter/2 - canvasPadding; // 円の半径
     const angle = Math.PI*1.5; // 円全体の角度 上から円を開始

     for (let i =0; i < pinText.length; i++) {
          const _rad = i / pinText.length * Math.PI * 2 + angle;
          const x = h * Math.cos(_rad) + cx;
          const y = h * Math.sin(_rad) + cy;
          arrPinInfo[i] = {
               'id' : i ,
               'name' : arrPinInfo[i],
               'boin' : arrAiueo[arrPinInfo[i]],
               'x' : x,
               'y' : y };
     }

     return arrPinInfo;
}

/**
 * ピンの情報
 *18文字程度座標系さん参考https://www.webdelog.info/entry/2016/06/12/arranged-in-the-circumferential-direction.html
 */

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
    getCanvas();

    const canvas = document.getElementById('kiban');
    let link     = document.getElementById('hiddenLink');
    link.href    = canvas.toDataURL();

    document.getElementById('canvasImage').src = canvas.toDataURL();
    link.click();
}

