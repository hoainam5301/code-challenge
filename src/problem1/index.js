// Problem 1: Three ways to sum to n
// Input: n - any integer, output: summation from 1 to n (e.g. sumToN(5) === 15)
// Assumption: |result| will always be less than Number.MAX_SAFE_INTEGER.

// Implementation A: Iterative loop (also handles negative n by summing down to n)
var sumToNA = function (n) {
  let sum = 0;
  if (n >= 0) {
    for (let i = 1; i <= n; i++) {
      sum += i;
    }
  } else {
    for (let i = -1; i >= n; i--) {
      sum += i;
    }
  }
  return sum;
};

// Implementation B: Mathematical formula (Gauss' sum), O(1) time and space
var sumToNB = function (n) {
  return (n * (n + 1)) / 2;
};

// Implementation C: Recursion
var sumToNC = function (n) {
  if (n === 0) return 0;
  if (n > 0) return n + sumToNC(n - 1);
  return n + sumToNC(n + 1);
};

console.log(sumToNA(5)); // 15
console.log(sumToNB(5)); // 15
console.log(sumToNC(5)); // 15

module.exports = { sumToNA, sumToNB, sumToNC };
