// pages/stopwatch/stopwatch.js
const app = getApp();
import Utils from '../../utils/index';
import regeneratorRuntime from '../../tools/regenerator-runtime/runtime';

// 页面阶段
const PageSteps = {
  gameStart: 0,
  preGame: 1,
  game: 2,
  gameOver: 3,
};

const PRE_TOTAL_TIMES = 3;
const TOTAL_TIMES = 5; // TODO:

let tt = 0;
const WatchStatus = {
  Begin: 0,
  Start: 1,
  Pause: 2,
  // Waiting: 3,
  End: 3,
};
const titleMap = {
  [WatchStatus.Begin]: '请尽可能快地点击',
  [WatchStatus.Start]: '进行中，点击结束',
  [WatchStatus.Pause]: '暂停',
  [WatchStatus.End]: '已结束',
};

const PreGameWatchStatus = {
  Begin: 0,
  Start: 1,
  Pause: 2,
  Success: 3,
  Fail: 4,
};
const preGameTitleMap = {
  [PreGameWatchStatus.Begin]: '请尽可能快地点击',
  [PreGameWatchStatus.Start]: '请尽可能快地点击',
  [PreGameWatchStatus.Pause]: '请尽可能快地点击',
  [PreGameWatchStatus.Success]: '不错',
  [PreGameWatchStatus.Fail]: '再试一次',
};

function leftPad(num) {
  if (num < 10) {
    return '0' + num;
  } else {
    return '' + num;
  }
}

let pauseFlag = false;
let watchLock = false;
let kWatchNum = '';
let kWatchNumMs = '';

Page({

  data: {
    userInfo: {},

    // 阶段
    pageStep: PageSteps.gameStart,

    // game-start
    gameStartData: {
      headerImgUrl: '../../images/game_stopwatch.png',
      title: '超级秒表',
      time: 3,
      desc: '超级秒表测查反应力，特别是指个体对外界信号做出快速反应的能力',
      bestScore: 1000,
      remainCount: 2,
    },

    // game-over
    gameOverData: {
      score: 0,
      history: 0,
    },

    // 引导阶段
    showPreGameMask: true,
    preGameTitleMap: preGameTitleMap,
    preGameWatchStatus: PreGameWatchStatus.Begin,
    preGameTryTimes: 0,
    preGameTotalTimes: PRE_TOTAL_TIMES,

    // 倒计时
    showCountdown: false,
    countdownNum: 3,

    // 进度
    tryTimes: 0,
    totalTimes: TOTAL_TIMES,
    fastestTime: 1000,

    // 秒表
    title: titleMap[WatchStatus.Begin],
    watchNum: '00:00',
    watchNumMs: '0',
    watchStatus: WatchStatus.Start,
    timer: null,
    disableClick: true,
    watchFail: false,
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

    this.initData();
  },

  onHide() {
    this.clearTimer();
  },

  onUnload() {
    this.clearTimer();
  },

  initData() {
    const currentGame = app.globalData.gameList[0] || {};
    const gameStartData = this.data.gameStartData;
    gameStartData.bestScore = currentGame.bestScore || gameStartData.bestScore;
    gameStartData.remainCount = currentGame.remainCount || gameStartData.remainCount;
    this.setData({
      gameStartData,
    });
  },

  /**
   * 开始游戏
   */
  async gameStart() {
    console.log('stopwatch gameStart');
    this.setData({
      pageStep: PageSteps.preGame,
    });

    await this.preGame();

    // await this.countdown();
    // await this.watchStart();
  },

  /**
   * 指引阶段
   */
  async preGame() {
    console.log('stopwatch preGame');
  },

  preGameClick() {
    console.log('hide pre game mask');
    this.setData({
      preGameWatchStatus: PreGameWatchStatus.Start,
      showPreGameMask: false,
      disableClick: false,
    });
    this.watchStart(true);
  },

  /**
   * 结束游戏
   */
  scoreShare() {
    console.log('stopwatch scoreShare');
  },

  /**
   * 一些公共方法
   */
  setDataPromise(data, callback) {
    return new Promise((resolve, reject) => {
      this.setData(data, () => {
        callback && callback();
        resolve();
      })
    });
  },

  /**
   * 倒计时
   */
  async countdown() {
    this.setData({
      showCountdown: true,
    });

    const countdownList = [3, 2, 1, 0];
    for (let i = 0; i < countdownList.length; i++) {
      this.setData({
        countdownNum: countdownList[i],
      });
      await Utils.snooze(1000);
    }

    this.setData({
      showCountdown: false,
      disableClick: false,
    });
  },

  /**
   * 秒表点击
   */
  async watchStart(isPreGame) {
    // if (isPreGame) {
    //   await this.preGameWatchClick();
    // } else {
    //   await this.watchClick();
    // }
    this.watchClickEntrance();
  },

  watchClickEntrance() {
    const currentStep = this.data.pageStep;
    if (currentStep === PageSteps.preGame) {
      this.preGameWatchClick();
    } else {
      this.watchClick();
    }
  },

  async preGameWatchClick() {
    const watchStatus = this.data.preGameWatchStatus;
    console.log(`pre game watchStatus: ${watchStatus}`);

    if (this.data.disableClick) {
      return;
    }

    switch(watchStatus) {
      case PreGameWatchStatus.Start:
        this.setData({
          preGameWatchStatus: PreGameWatchStatus.Pause,
        });
        this.startTick();
        break;

        case WatchStatus.Pause:
          const pauseResult = await this.preGamePauseClick();
          if (!pauseResult) {
            return;
          }
          pauseFlag = false;

          if (this.data.preGameTryTimes >= this.data.preGameTotalTimes) {
            this.setData({
              pageStep: PageSteps.game,
            }, () => {});
            this.clearTimer();
            Utils.snooze(5 * 1000);
            await this.countdown();
            await this.watchStart();
          } else {
            this.setData({
              disableClick: true,
            }, () => {});
            this.startTick();
          }
          break;

        case WatchStatus.Success:
        case WatchStatus.Fail:
          break;
    }
  },

  async watchClick() {
    const watchStatus = this.data.watchStatus;
    console.log(`watchStatus: ${watchStatus}`);

    if (this.data.disableClick) {
      return;
    }

    switch(watchStatus) {
      // case WatchStatus.Begin:
      //   this.setData({
      //     watchStatus: WatchStatus.Start,
      //     title: titleMap[WatchStatus.Start],
      //   }, () => {});
      //   break;

      case WatchStatus.Start:
        this.setData({
          watchStatus: WatchStatus.Pause,
          title: titleMap[WatchStatus.Pause],
        }, () => {});
        this.startTick();
        break;

      case WatchStatus.Pause:
        const pauseResult = await this.pauseClick();
        if (!pauseResult) {
          return;
        }
        pauseFlag = false;

        if (this.data.tryTimes >= this.data.totalTimes) {
          this.setData({
              watchStatus: WatchStatus.End,
              title: titleMap[WatchStatus.End],
              disableClick: true,
            }, () => {});
          this.stopTick();
        } else {
          this.setData({
            // watchStatus: WatchStatus.Waiting,
            title: titleMap[WatchStatus.Start],
            disableClick: true,
          }, () => {});
          this.startTick();
        }
        break;

      case WatchStatus.End:
        this.stopTick();
        break;

      default:
        break;
    }
  },

  /**
   * 秒表逻辑
   */
  getTimer() {
    return setInterval(() => {
      tt += 10;
      if (tt < 1000) {
        this.setData({
          watchNum: this.numberFormat(tt),
          watchNumMs: Math.floor(Math.random() * 10),
        });
      } else {
        this.setData({
          watchNum: this.numberFormat(1000),
          watchNumMs: 0,
          watchFail: true,
        });
        this.watchStart();
      }
    }, 10);
  },

  async startTick() {
    console.log('startTick');
    if (!this.data.timer) {
      this.setData({
        timer: this.getTimer(),
        disableClick: false,
        watchFail: false,
      });
    }
  },

  async preGamePauseClick() {
    console.log(`pre game pauseClick, pauseFlag:${pauseFlag}`);
    if (pauseFlag) {
      return false;
    }
    pauseFlag = true;

    // const currentTime = tt + this.data.watchNumMs;
    const currentTime = this.getCurrentTime();
    const accuracy = currentTime < 1000;
    await this.setDataPromise({
      preGameWatchStatus: accuracy ? PreGameWatchStatus.Success : PreGameWatchStatus.Fail,
      preGameTryTimes: this.data.preGameTryTimes + 1,
    });

    this.clearTimer();

    const randomGap = 1000 + Math.floor(Math.random() * 1000);
    console.log(`randomGap: ${randomGap}`);
    await Utils.snooze(randomGap);

    await this.setDataPromise({
      preGameWatchStatus: PreGameWatchStatus.Pause,
    });

    return true;
  },

  async pauseClick() {
    console.log(`pauseClick, pauseFlag:${pauseFlag}`);
    if (pauseFlag) {
      return false;
    }
    pauseFlag = true;

    // const currentTime = tt + this.data.watchNumMs;
    const currentTime = this.getCurrentTime();

    // 数据上报
    this.saveData({
      accuracy: currentTime <= 1000 ? 1 : -1,
      responseTime: currentTime,
    });

    // 记录最快速度
    console.log(`currentTime: ${currentTime}, fastestTime: ${this.data.fastestTime}`);
    if (currentTime < this.data.fastestTime) {
      await this.setDataPromise({
        tryTimes: this.data.tryTimes + 1,
        fastestTime: currentTime,

        watchNum: kWatchNum,
        watchNumMs: kWatchNumMs,
      });
    } else {
      await this.setDataPromise({
        tryTimes: this.data.tryTimes + 1,

        watchNum: kWatchNum,
        watchNumMs: kWatchNumMs,
      });
    }

    this.clearTimer();

    const randomGap = 1000 + Math.floor(Math.random() * 1000);
    console.log(`randomGap: ${randomGap}`);
    await Utils.snooze(randomGap);

    return true;
  },

  stopTick() {
    console.log('stopTick');
    this.clearTimer();

    this.setData({
      pageStep: PageSteps.gameOver,
      gameOverData: {
        score: this.data.fastestTime,
        history: 0,
      },
    });
  },

  async clearTimer() {
    clearInterval(this.data.timer);
    this.setData({
      timer: null,
    });
    tt = 0;
  },

  numberFormat(num) {
    const s = Math.floor(num / 1000) + ':';
    const ms = leftPad(Math.floor(num % 1000 / 10)) || '00';
    if (num < 10000) {
      return '0' + s + ms;
    } else {
      return s + ms;
    }
  },

  getCurrentTime() {
    const watchNum = this.data.watchNum;
    const watchNumMs = this.data.watchNumMs;
    console.log('\n\n++++++', watchNum, watchNumMs);
    kWatchNum = watchNum;
    kWatchNumMs = watchNumMs;
    const curTime = watchNum + '' + watchNumMs;
    return parseInt(curTime.replace(':', ''), 10);
  },

  /**
   * 数据库操作
   */
  saveData({
    accuracy,
    responseTime,
  }) {
    const db = wx.cloud.database();
    db.collection('stopwatch').add({
      data: {
        userInfo: app.globalData.userInfo,
        acc: accuracy,
        rt: responseTime,
      },
    }).then(res => {
      console.log(res)
    });
  }
})

