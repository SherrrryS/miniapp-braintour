// gameStart.js

Component({

  properties: {
    gameStartData: {
      type: Object,
      value: {},
    },
  },

  data: {
    // title: gameStartData.title || '',
    // time: gameStartData.time || 0,
    // desc: gameStartData.desc || '',
    // bestScore: gameStartData.bestScore || 0,
    // remainCount: gameStartData.remainCount || 0,
  },

  /**
   * 生命周期
   */
  lifetimes: {
    attached() { },
    moved() { },
    detached() { },
  },

  methods: {
    start() {
      console.log('点击开始');
      this.triggerEvent('gameStart');
    },
  },
})

