//index.js
const app = getApp();
import Utils from '../../utils/index';
import User from '../../utils/user';
import regeneratorRuntime from '../../tools/regenerator-runtime/runtime';

const PageSteps = {
  loading: 0,
  intro: 1,
  login: 2,
  home: 3,
};
const identityDoubleList = [
  ['女儿', '儿子'],
  ['妈妈', '爸爸'],
  ['奶奶', '爷爷'],
];

Page({
  data: {
    // 页面状态
    pageStep: PageSteps.loading, // TODO:

    // login
    genderList: [
      { name: '女', value: 0 },
      { name: '男', value: 1 },
    ],
    genderChecked: 0,
    birthday: '1980-01-01',
    identityList: ['子女', '父母', '祖辈'],
    indentityIndex: 0,
    agreePrivacyPolicy: false,
    showPrivacyPolicy: false,
    participants: 0,

    // home
    // gameList: [{
    //   name: '超级秒表',
    //   url: '../stopwatch/stopwatch',
    //   image: '../../images/game_stopwatch.png',
    //   leftTimes: 2,
    //   statusStr: '还剩2次',
    // }, {
    //   name: '位置记忆',
    //   url: '../squareShorthand/squareShorthand',
    //   image: '../../images/game_squareShorthand.png',
    //   leftTimes: 2,
    //   statusStr: '还剩2次',
    // }, {
    //   name: '倒背数',
    //   url: '../backwardNumbers/backwardNumbers',
    //   image: '../../images/game_backwardNumbers.png',
    //   leftTimes: 2,
    //   statusStr: '还剩2次',
    // }],
    gameList: [],

    avatarUrl: '../../images/user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: ''
  },

  onLoad: function(params) {
    console.log('index onLoad', params);

    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }

    this.onGetOpenid();

    // 获取用户信息
    this.getSetting();

    // this.initGame();

    // 获取数据库用户信息
    this.getDatabaseUserData();

    // 分享
    wx.showShareMenu({
      // 要求小程序返回分享目标信息
      withShareTicket: true,
    }); 
  },

  getSetting() {
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              });
              wx.setStorage({
                key: 'userInfo',
                data: res.userInfo,
              });
              app.globalData.userInfo = res.userInfo;
            }
          });
        } else {
          console.log('未获得授权');
        }
      }
    });
  },

  onGetUserInfo(e) {
    // console.log(app.globalData.userInfo, e.detail.userInfo)
    if (!e.detail.userInfo) {
      return;
    }
    if (!app.globalData.userInfo) {
      this.setData({
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      });
      app.globalData.userInfo = e.detail.userInfo;
      this.introClick();
    } else {
      this.introClick();
    }
  },

  // onGotUserInfo

  onGetOpenid() {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        // console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
        // wx.navigateTo({
        //   url: '../userConsole/userConsole',
        // })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        // wx.navigateTo({
        //   url: '../deployFunctions/deployFunctions',
        // })
      }
    })
  },

  onShareAppMessage(res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '脑力指纹',
      path: `pages/index/index`,
      imageUrl: '../../images/game_backwardNumbers.png',
    };
  },

  getDatabaseUserData() {
    wx.cloud.callFunction({
      name: 'apricot',
      data: {
        api: 'get',
        table: 'user',
      },
    }).then((res = {}) => {
      console.log(res.result);
      const userData = res.result.data;
      // console.log(userData)
      // this.setData({
      //   pageStep: userData.length > 0 ? PageSteps.home : PageSteps.intro,
      // });
      if (userData.length === 0) {
        const gameList = this.initGame({});
        this.setData({
          pageStep: PageSteps.intro,
          gameList,
        });
        this.getUserCount();
      } else {
        console.log(userData[0])
        const gameList = this.initGame(userData[0]);
        console.log(gameList);
        this.setData({
          pageStep: PageSteps.home,
          gameList,
        });
        app.globalData.gameList = gameList;
      }
    }).catch(err => {
      console.log(err);
    });
  },

  /**
   * intro
   */
  introClick() {
    this.setData({
      pageStep: PageSteps.login,
    });
  },

  /**
   * login
   */
  getUserCount() {
    wx.cloud.callFunction({
      name: 'apricot',
      data: {
        api: 'user/count',
        table: '',
      },
    }).then((res = {}) => {
      console.log(res.result)
      this.setData({
        participants: res.result.total,
      });
    }).catch(err => {
      console.log(err);
    });
  },

  genderChange(e) {
    console.log('性别修改为', e.detail.value)
    this.setData({
      genderChecked: e.detail.value - 0,
    });
  },

  birthdayChange(e) {
    console.log('生日修改为', e.detail.value)
    this.setData({
      birthday: e.detail.value,
    });
  },

  identityChange(e) {
    console.log('身份修改为', e.detail.value)
    this.setData({
      indentityIndex: e.detail.value - 0,
    });
  },

  agreePrivacyPolicyChange(e) {
    console.log('同意隐私协议修改为', e.detail.value)
    this.setData({
      agreePrivacyPolicy: true,
    });
  },

  showPrivacyPolicyPopup() {
    this.setData({
      showPrivacyPolicy: true,
    });
  },
  closePrivacyPolicyPopup() {
    this.setData({
      showPrivacyPolicy: false,
    });
  },

  loginClick() {
    if (this.data.agreePrivacyPolicy) {
      this.setDatabaseUserData(() => {
        this.setData({
          pageStep: PageSteps.home,
        });
      });
    } else {
      wx.showToast({
        title: '请同意隐私协议',
        icon: 'none',
      });
    }
  },

  setDatabaseUserData(callback) {
    const user = new User();
    wx.cloud.callFunction({
      name: 'apricot',
      data: {
        api: 'add',
        table: 'user',
        data: {
          profile: {
            gender: this.data.genderChecked,
            birthday: this.data.birthday,
            identity: this.data.indentityIndex,
          },
          userInfo: app.globalData.userInfo,
          progress: user.getProgress().map(item => ({
            name: item.name,
            leftTimes: item.leftTimes,
            bestScore: item.bestScore,
          })), // TODO: 如果加入新的游戏，玩过游戏的人该怎么办？？？？
        },
      },
    }).then(res => {
      console.log(res);
      callback && callback();
    }).catch(err => {
      console.log(err);
    });
  },

  /**
   * home
   */
  initGame(userData = {}) {
    const { progress = [] } = userData;
    let progressMap = {};
    progress.forEach(item => {
      progressMap[item.name] = item.leftTimes;
    });

    const user = new User();
    let gameList = user.getProgress();
    gameList = gameList.map(item => {
      const leftTimes = progressMap[item.name] || item.leftTimes;
      const canPlay = leftTimes > 0;
      return Object.assign(item, {
        leftTimes,
        statusStr: canPlay ? `还剩${leftTimes}次` : '已完成',
        cardFlagClassName: canPlay ? 'card-flag' : 'card-flag card-flag-finish',
        goStr: canPlay ? '去测试 >' : '已测试',
        goClassName: canPlay ? 'card-text-right' : 'card-text-right-finish',
      });
    });
    return gameList;
  },
});
