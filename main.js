'use strict';

/* global exec, rm, env, cd, exit */
var moment = require('moment-timezone');
var cheerio = require('cheerio');
require('isomorphic-fetch');
require('shelljs/global');

/*
note
api網址 https://g0v.github.io/blood/blood.json
如果只是回傳json格式, 那為啥要寫檔?
=>
喔喔, 他是每天呼叫一次, 寫在json檔
然後網址是打開那個json檔
所以json檔等於是備份就是了
不用每一次打開url都爬一次資料
*/

module.exports.fetch = (event, context, callback) => {
  var status = {
    'images/StorageIcon001.jpg': 'empty',
    'images/StorageIcon002.jpg': 'medium',
    'images/StorageIcon003.jpg': 'full'
  };

  /**
   * isomorphic-fetch套件, 提供"全域"fetch method,
   * 所以fetch可用在server/client端, 介面是一致的
   * 全域的設計我想是為了配合前端使用
   */
  fetch('http://www.blood.org.tw/Internet/main/index.aspx')
  .then(res => res.text()) // callback直接回傳的寫法
  .then(html => { // html是上一個then callback的回傳值, 也就是res.text()
    /**
     *cheerio是server端的jquery, 可以在server端使用jquery的語法
     */
    var $ = cheerio.load(html);

    var storages = $('.Storage').toArray();

    /**
     * moment timezone套件, format()回傳的就是iso8601格式, 還不錯用
     * 如果前端網頁有需要使用iso8601, 可考慮此套件
     */
    var json = {time: moment().tz('Asia/Taipei').format()};

    storages.forEach(function(s) {
      var name = $(s).find('#StorageHeader a').text();
      json[name] = {name: name};
      var types = ['StorageA', 'StorageB', 'StorageO', 'StorageAB'];
      types.forEach(function(type) {
        var data = status[$(s).find('#' + type + ' img').attr('src')];
        json[name][type] = data;
      });
    });

    /**
     * shelljs套件提供mkdir功能
     */
    mkdir('-p', 'out');

    // to function是寫檔, 在shelljs塞到String的prototype, 操!!
    // 這種亂塞prototype的方式真的很難維護
    JSON.stringify(json, null, 2).to('out/blood.json');
    callback(null, json);
  })
  .catch(err => callback(err));
}

/**
 * require.main === module 若為true => 是直接用node.js跑 (node main.js)
 * 不過為啥要特別擋這個, 有點不太懂
 */
if (require.main === module) {
  module.exports.fetch(null, null, (err, result) => {
    console.log(result);
  });
}
