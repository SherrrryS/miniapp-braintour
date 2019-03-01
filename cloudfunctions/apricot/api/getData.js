/**
 * getData
 */
const cloud = require('wx-server-sdk');

async function getData(event, context) {
    const wxContext = cloud.getWXContext();
    const openId = wxContext.OPENID;
    console.log(openId);

    const tableName = event.table;

    const db = cloud.database();
    let res;
    try {
        res = await db.collection(tableName).where({
            _openid: openId,
        }).get();
    } catch(err) {
        console.log(`Error: getData, ${err}`);
    }

    return res;
}

module.exports = getData;