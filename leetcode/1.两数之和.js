/*
 * @lc app=leetcode.cn id=1 lang=javascript
 *
 * [1] 两数之和
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function (nums, target) {
  let result = [];
  nums.forEach((item, index) => {
    if (result.length < 1) {
      const targetIndex = nums.findIndex(
        (n, i) => i > index && n + item === target
      );
      if (targetIndex > -1) {
        result = [index, targetIndex];
      }
    }
  });
  return result;
};
// @lc code=end
