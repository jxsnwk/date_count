const arrOmikuji = [
    'デス大吉',
    'デス吉',
    'デス大凶',
    'ハル吉',
    '中吉',
    '小吉',
    '吉',
    '末吉',
    '凶'
];
const arrPartner = [
    {name : '空下ハル'  , img : 'haru.png'},
    {name : '奥津城夏夜', img : 'kaya.png'},
    {name : '升武巳'    , img : 'takemi.png'},
    {name : '月見里理人', img : 'rihito.png'},
    {name : '奏音結愛'  , img : 'yume.png'},

    {name : 'right'         , img : 'right.png'},
    {name : 'rat/寝住トエル' , img : 'toeru.png'},
    {name : 'KAISER/矴ツカイ', img : 'tsukai.png'},
    {name : '7se/魚倉ナナセ' , img : 'nanase.png'},
    {name : 'shu/天森シュウ' , img : 'shu.png'},
    {name : '120K/三十里セキ', img : 'seki.png'},
    {name : 'SiX/六庄エニシ' , img : 'enishi.png'},
    {name : '◇/菱ネイロ'    , img : 'neiro.png'},

    {name : '天森ユウ' , img : 'yu.png'},
    {name : 'ポプリ'   , img : 'popuri.png'},
    {name : 'ぴあッチ' , img : 'pia.png'},
];

window.onload = function() {
    setTimeout(() => {
    const spinner = document.getElementById('loading');
    spinner.classList.add('loaded');
    }, 1000);
  }

function buttonClick() {
    const btn     = document.getElementById('btn');
    const unsei   = document.getElementById('unsei');
    const partner = document.getElementById('partner');

    // ランダム算出
    const oimkujiKey = Math.floor(Math.random() * arrOmikuji.length);
    const partnerKey = Math.floor(Math.random() * arrPartner.length);

    const unseiResult = arrOmikuji[oimkujiKey];
    const partnerResult 
    = '<img src="img/' + arrPartner[partnerKey]['img'] + '"><br>' + 
      '<span>' + arrPartner[partnerKey]['name'] + '</span>';

    // 結果を挿入
    unsei.textContent   = unseiResult;
    partner.innerHTML   = partnerResult;
}