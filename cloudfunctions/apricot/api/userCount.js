/**
 * userCount
 */
const cloud = require('wx-server-sdk');

async function userCount(event, context) {
    const wxContext = cloud.getWXContext();
    const openId = wxContext.OPENID;

    const db = cloud.database();
    let res;
    try {
        res = await db.collection('user').count();
    } catch(err) {
        console.log(`Error: userCount, ${err}`);
    }

    return res;
}

module.exports = userCount;