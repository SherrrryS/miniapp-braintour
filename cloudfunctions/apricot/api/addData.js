/**
 * addData
 */
const cloud = require('wx-server-sdk');

async function addData(event, context) {
    console.log(event)
    console.log(context)
  
    const wxContext = cloud.getWXContext();
    const openId = wxContext.OPENID;
  
    const tableName = event.table;
  
    const db = cloud.database();
    let res;
    try {
      res = await db.collection(tableName).add({
        data: Object.assign({}, event.data, {
          _openid: openId,
        }),
      });
    } catch(err) {
      console.error(`Error: addData, ${err}`);
    }
  
    return res;
  }

module.exports = addData;