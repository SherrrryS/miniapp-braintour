// 云函数模板
// 部署：在 cloud-functions/login 文件夹右击选择 “上传并部署”

/**
 * apricot 杏子API
 */

const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init()

const getData = require('./api/getData');
const addData = require('./api/addData');
const userCount = require('./api/userCount');

/**
 * 
 * event 参数包含小程序端调用传入的 data
 * 
 */
exports.main = async (event, context) => {
  console.log(event)
  console.log(context)

  let res;
  switch (event.api) {
    case 'get':
      res = await getData(event, context);
      break;

    case 'add':
      res = await addData(event, context);
      break;

    // 获取用户总数
    case 'user/count':
      res = await userCount(event, context);
      break;
  }

  return res;
}
