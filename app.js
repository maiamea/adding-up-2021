'use strict';
// モジュールの呼び出し
const fs = require('fs'); // ファイルを扱うためのモジュール
const readline = require('readline'); // ファイルを一行ずつ読み込むためのモジュール

// popu-pref.csv ファイルから、ファイルの読み込みを行う Stream（ストリーム）を生成
const rs = fs.createReadStream('./popu-pref.csv');
// readline オブジェクトの input として設定し rl オブジェクトを作成
const rl = readline.createInterface({ input: rs, outoput: {} });
// データを組み替えるためのMapデータ
const prefectureDataMap = new Map(); // key: 都道府県 value: 集計データのオブジェクト

// rl オブジェクトで line というイベントが発生したら無名関数を呼ぶ
rl.on('line', lineString => {
  // console.log(lineString);

  // ファイルを行単位で処理するコード
  const columns = lineString.split(',');
  const year = parseInt(columns[0]); // 集計年
  const prefecture = columns[1]; // 都道府県名
  const popu = parseInt(columns[3]); // 15〜19歳の人口
  if (year === 2010 || year === 2015) {
    // 集計年が2010年または2015年のデータのみを処理
    // console.log(year);
    // console.log(prefecture);
    // console.log(popu);
    // console.log('---');

    let value = null;
    if (prefectureDataMap.has(prefecture)) {
      // 2周目以降で既に都道府県のキーがある場合は、valueに登録されたデータが入る
      value = prefectureDataMap.get(prefecture);
    } else {
      // 1周目でデータがない時は都道府県ごとのデータの入れ物を作る (valueを初期化)
      value = {
        popu10: 0, // 2010 年の人口
        popu15: 0, // 2015 年の人口
        change: null // 人口の変化率
      };
    }
    // 年度別のデータをセット
    if (year === 2010) {
      value.popu10 = popu;
    }
    if (year === 2015) {
      value.popu15 = popu;
    }
    // 都道府県をキーにしてデータを登録
    prefectureDataMap.set(prefecture, value);
  }
});

// 全ての行を読み込み終わった時に呼ばれる
// ファイルの読み込み終了時に処理したいコードを書く
rl.on('close', () => {
  // 変化率を計算
  for (const [key, value] of prefectureDataMap) {
    value.change = value.popu15 / value.popu10;
  }

  // ランキング化(降順に並べ替えられた)したデータを作成
  const rankingArray = Array.from(prefectureDataMap).sort((pair1, pair2) => {
    return pair2[1].change - pair1[1].change;
  });

  // データを整形
  const rankingStrings = rankingArray.map(([key, value]) => {
    return (
      `${key}: ${value.popu10} => ${value.popu15} 変化率： ${value.change}`
    );
  });

  console.log(prefectureDataMap);
  console.log(rankingArray);
  console.log(rankingStrings);
});