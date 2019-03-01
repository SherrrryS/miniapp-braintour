/**
 * 一些工具方法
 */

class Utils {
    static snooze(ms = 0) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export default Utils;
