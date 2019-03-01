// gameStart.js

Component({

  properties: {
    gameOverData: {
      type: Object,
      value: {},
    },
  },

  data: {
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
    share() {
      console.log('点击Share');
      this.triggerEvent('scoreShare');
    },
  },
})

