/*
 * @lc app=leetcode.cn id=7 lang=javascript
 *
 * [7] 整数反转
 */

// @lc code=start
/**
 * @param {number} x
 * @return {number}
 */
var reverse = function (x) {
  let result = 0;
  while (x) {
    result = result * 10 + (x % 10);
    if (result > Math.pow(2, 31) - 1 || result < Math.pow(-2, 31)) return 0;
    x = x > 0 ? Math.floor(x / 10) : Math.ceil(x / 10);
  }
  return result;
};

// const result = reverse(214315342);
// console.log(result);

/**
 * Math.pow(a,b) —— 取a的b次方
 * Math.floor(a) —— 取地板值，a为负数时候需要注意取值方向
 *                  Math.floor(-12.3) // -13
 *                  Math.floor(12.3)  // 12
 */
// @lc code=end
