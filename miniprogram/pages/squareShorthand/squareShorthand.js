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

    // 盒子初始化数据
    boxRow: 2,
    boxCol: 3,
    itemList: [],
    boxWidth: 0,
    targetNum: 3,

    hideTarget: false,
    clickCount: 0,
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
    this.initBox();
  },

  onHide() {
  },

  onUnload() {
  },

  // 生成盒子
  async initBox() {
    this.initItemList();
    this.initTarget();
    await Utils.snooze(2000);
    this.hideTarget();
  },

  initItemList() {
    const boxRow = this.data.boxRow;
    const boxCol = this.data.boxCol;
    const itemList = [];
    for (let row = 0; row < boxRow; row++) {
      for (let col = 0; col < boxCol; col++) {
        itemList.push({
          index: row * boxCol + col,
          isTarget: false,
          isClick: false,
        });
      }
    }

    const boxWidth = boxCol * ITEM_WIDTH;

    this.setData({
      itemList,
      boxWidth,
    });
  },

  initTarget() {
    let targetNum = this.data.targetNum;
    const totalNum = this.data.boxRow * this.data.boxCol;
    const itemList = this.data.itemList.slice();
    while(targetNum > 0) {
      const randomIndex = Math.floor(Math.random() * totalNum);
      console.log(randomIndex);
      if (!itemList[randomIndex].isTarget) {
        itemList[randomIndex].isTarget = true;
        targetNum -= 1;
      }
    }
    this.setData({
      itemList,
    });
  },

  hideTarget() {
    console.log('hideTarget');
    this.setData({
      hideTarget: true,
      startTime: 0,
      endTime: 0,
    });
  },

  /**
   * 点击事件
   */
  async itemClick(event) {
    const clickCount = this.data.clickCount || 0;
    if (clickCount >= this.data.targetNum) {
      return;
    } else if (clickCount === 0) {
      this.setData({
        startTime: Date.now(),
      });
    }
    const currentTarget = event.currentTarget;
    const index = currentTarget.dataset.index;
    const itemList = this.data.itemList.slice();
    itemList[index].isClick = true;
    this.setData({
      itemList,
      clickCount: clickCount + 1,
    });

    // 本轮结束
    console.log(clickCount, this.data.tryTimes, this.data.totalTimes);
    if (clickCount === this.data.targetNum - 1) {
      if (this.data.tryTimes === this.data.totalTimes) {
        // 游戏结束
        return;
      }
      this.setData({
        endTime: Date.now(),
      });
  
      this.calBox();
      await Utils.snooze(2000);

      this.setData({
        tryTimes: this.data.tryTimes + 1,
        clickCount: 0,
        hideTarget: false,
      });

      this.initBox();
    }
  },

  /**
   * 每轮游戏结束后计算下一轮目标方块数量、总数量
   */
  calBox() {
    const itemList = this.data.itemList;
    console.log(itemList);
    const correctCount = itemList.filter(item => (item.isTarget && item.isClick)).length;
    const failCount = itemList.filter(item => (!item.isTarget && item.isClick)).length;
    const resp = itemList.map(item => {
      return item.isClick ? item.index : '';
    }).filter(item => item !== '').join('');

    // 数据上报
    this.saveData({
      resp,
      accuracy: correctCount === targetNum,
      responseTime: this.data.endTime - this.data.startTime,
    });
    
    const targetNum = this.data.targetNum;
    if (correctCount === targetNum) { // 本轮通过
      // 记录每轮结果
      const tryResult = this.data.tryResult;
      tryResult.push(true);

      // 改变box
      if (targetNum * 2 === this.data.boxRow * this.data.boxCol) { // 目标数将要超过总数的一半，增大box
        this.setData({
          boxRow: this.data.boxRow + 1,
          boxCol: this.data.boxCol + 1,
          targetNum: targetNum + 1,
        });
      } else {
        this.setData({
          targetNum: targetNum + 1,
        });
      }
    } else { // 本轮失败
      // 记录每轮结果
      const tryResult = this.data.tryResult;
      tryResult.push(false);

      // console.log(this.data.tryTimes, tryResult)
      if (this.data.tryTimes > 1 && !tryResult.slice(-1)[0] && !tryResult.slice(-2)[0]) {
        if ((targetNum - 1) * 2 === (this.data.boxRow - 1) * (this.data.boxCol - 1)) { // 目标数将要等于减小box总数的一半，减小box
          this.setData({
            boxRow: this.data.boxRow - 1,
            boxCol: this.data.boxCol - 1,
            targetNum: targetNum - 1,
          });
        } else {
          this.setData({
            targetNum: targetNum - 1,
          });
        }
      } else {
        // 不变
      }
    }
  },

  /**
   * 数据库操作
   */
  saveData({
    resp,
    accuracy,
    responseTime,
  }) {
    const db = wx.cloud.database();
    db.collection('squareShorthand').add({
      data: {
        // userInfo: this.data.userInfo,
        userInfo: app.globalData.userInfo,
        slen: this.data.targetNum,
        resp,
        acc: accuracy,
        rt: responseTime,
      },
    }).then(res => {
      console.log(res)
    });
  }
})

