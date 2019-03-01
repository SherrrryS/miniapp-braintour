// pages/squareShorthand/squareShorthand.js
const app = getApp();
import Utils from '../../utils/index';
import regeneratorRuntime from '../../tools/regenerator-runtime/runtime';

const TOTAL_TIMES = 5; // TODO:
const ITEM_WIDTH = 100;

Page({

  data: {
    userInfo: {},

    // 阶段
    tryTimes: 0,
    totalTimes: TOTAL_TIMES,
    tryResult: [],

    // 
    targetNum: 2,
    orderNumberList: [],
    orderNumber: '',
    clickNumberList: [],
    
    keyboardNumbers: [1,2,3,4,5,6,7,8,9,0],

    showKeyboard: false,
    startTime: 0,
    endTime: 0,
  },

  /**
   * 生命周期
   */
  onLoad(options) {
    // 获取用户信息
    // wx.getStorage({
    //   key: 'userInfo',
    //   success: res => {
    //     console.log(res.data)
    //     this.setData({
    //       userInfo: res.data,
    //     })
    //   },
    // });

    // 初始化
    this.init();
  },

  onHide() {
  },

  onUnload() {
  },

  async init() {
    await this.genTargetNumbers();
    this.showKeyboard(true);
  },

  async genTargetNumbers() {
    let list = [];
    for (let i = 0; i < this.data.targetNum; i++) {
      const randomNumber = Math.floor(Math.random() * 10);
      list.push(randomNumber);
      this.setData({
        orderNumber: randomNumber,
      });
      await Utils.snooze(2000);
    }
    this.setData({
      orderNumberList: list.reverse(),
    });
  },

  showKeyboard(showStatus = false) {
    this.setData({
      showKeyboard: showStatus,
      startTime: Date.now(),
    });
  },

  async continueGame() {
    if (this.data.tryTimes === this.data.totalTimes) {
      return;
    } 
    this.setData({
      tryTimes: this.data.tryTimes + 1,
      clickNumberList: [],
    });
    this.showKeyboard(false);
    await this.genTargetNumbers();
    this.showKeyboard(true);
  },

  /**
   * 点击事件
   */
  keyboardClick(event) {
    const currentTarget = event.currentTarget;
    const clickNumber = currentTarget.dataset.number;
    const clickNumberList = this.data.clickNumberList;
    const clickNumberListLength = clickNumberList.length;

    if (this.data.orderNumberList[clickNumberListLength] === clickNumber) {
      console.log('点击正确');
    } else {
      console.log('点击错误');
      const tryResult = this.data.tryResult.slice();
      tryResult.push(false);
      if (this.data.tryTimes > 1 && !tryResult.slice(-1)[0] && !tryResult.slice(-2)[0]) {
        this.setData({
          targetNum: Math.max(2, this.data.targetNum - 1),
        });
      }

      // 终止当前试次
      this.saveData({
        accuracy: 0,
        responseTime: Date.now() - this.data.startTime,
      });
      this.continueGame();
      return;
    }
    clickNumberList.push(clickNumber);
    this.setData({
      clickNumberList,
    });

    if (clickNumberList.length === this.data.orderNumberList.length) { // 本次正确
      const tryResult = this.data.tryResult.slice();
      tryResult.push(true);

      this.setData({
        targetNum: this.data.targetNum + 1,
      });

      this.saveData({
        accuracy: 1,
        responseTime: Date.now() - this.data.startTime,
      });
      this.continueGame();
    }
  },

  /**
   * 数据库操作
   */
  saveData({
    accuracy,
    responseTime,
  }) {
    const db = wx.cloud.database();
    db.collection('backwardNumbers').add({
      data: {
        // userInfo: this.data.userInfo,
        userInfo: app.globalData.userInfo,
        slen: this.data.targetNum,
        cresp: this.data.orderNumberList.join(''),
        resp: this.data.clickNumberList.join(''),
        acc: accuracy,
        rt: responseTime,
      },
    }).then(res => {
      console.log(res)
    });
  }
})

