/*
 * @lc app=leetcode.cn id=2 lang=javascript
 *
 * [2] 两数相加
 */

// @lc code=start
/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} l1
 * @param {ListNode} l2
 * @return {ListNode}
 */
var addTwoNumbers = function (l1, l2) {
  const reverseStr1 = l1.reverse();
  const reverseStr2 = l2.reverse();
  const sum =
    Number.parseInt(reverseStr1.join("")) +
    Number.parseInt(reverseStr2.join(""));
  const sumStr = sum.toString().split("").reverse();
  const numList = sumStr.map((str) => Number.parseInt(str));
  console.log(numList);
  return numList;
};

// @lc code=end
