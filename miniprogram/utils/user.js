/**
 * user 用户方法
 */

class User {
    constructor() {
        this.profile = {
            gender: 0,
            birthday: '1980-01-01',
            identity: 0,
        };
        this.userInfo = {};
        this.progress = [{
            name: '超级秒表',
            url: '../stopwatch/stopwatch',
            image: '../../images/game_stopwatch.png',
            leftTimes: 2,
            bestScore: 1000,
        //   }, {
        //     name: '位置记忆',
        //     url: '../squareShorthand/squareShorthand',
        //     image: '../../images/game_squareShorthand.png',
        //     leftTimes: 2,
        }, {
        name: '倒背数',
        url: '../backwardNumbers/backwardNumbers',
        image: '../../images/game_backwardNumbers.png',
        leftTimes: 2,
        }];
    }

    getRawInfo() {
        return {
            profile: this.profile,
            userInfo: this.userInfo,
            progress: this.progress,
        };
    }

    getProgress() {
        return this.progress;
    }
}

module.exports = User;
