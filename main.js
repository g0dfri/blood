'use strict';

/* global exec, rm, env, cd, exit */
var moment = require('moment-timezone');
var cheerio = require('cheerio');
require('isomorphic-fetch');
require('shelljs/global');

/*
api網址 https://g0v.github.io/blood/blood.json
response:
{
  "time": "2020-02-13T22:16:25+08:00",
  "台北捐血中心": {
    "name": "台北捐血中心",
    "StorageA": "medium",
    "StorageB": "medium",
    "StorageO": "medium",
    "StorageAB": "medium"
  },
  "新竹捐血中心": {
    "name": "新竹捐血中心",
    "StorageA": "medium",
    "StorageB": "medium",
    "StorageO": "medium",
    "StorageAB": "full"
  },
  "台中捐血中心": {
    "name": "台中捐血中心",
    "StorageA": "full",
    "StorageB": "full",
    "StorageO": "medium",
    "StorageAB": "full"
  },
  "台南捐血中心": {
    "name": "台南捐血中心",
    "StorageA": "medium",
    "StorageB": "medium",
    "StorageO": "medium",
    "StorageAB": "full"
  },
  "高雄捐血中心": {
    "name": "高雄捐血中心",
    "StorageA": "medium",
    "StorageB": "medium",
    "StorageO": "medium",
    "StorageAB": "medium"
  }
}
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

    // to function看起來是寫檔, 不過找不到文件
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
