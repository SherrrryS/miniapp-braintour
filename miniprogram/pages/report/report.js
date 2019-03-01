// report.js
const app = getApp();

const PageSteps = {
  intro: 0,
  login: 1,
  home: 2,
};

Page({
  data: {
    avatarUrl: '../../images/user-unlogin.png',
    userInfo: {},
  },

  onLoad: function() {
    // 分享
    wx.showShareMenu({
      withShareTicket: true,
    });

    this.initData();
    console.log(app.globalData.userInfo.avatarUrl)
  },

  initData() {
    this.setData({
      avatarUrl: app.globalData.userInfo.avatarUrl,
    });
  },

  onShareAppMessage(res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '脑力指纹',
      path: `/pages/index/index?share_open_id=${app.globalData.openid}`
    }
  },
})
