var Promise = require('bluebird');

var MINUTE = 60;
var HOUR = 3600;

const DAY = 86400;

var configObject = {
  key: 90,
  another: 10 * 10,
  10: 'an "integer" key'
};

function getSecondsInDay() {
  return 24 * HOUR;
}

function getMillisecondsInDay() {
  // Some stylish code
  return (getSecondsInDay() *
    (1000)
  );
}

function callSetTimeoutZero(func) {
  setTimeout(func, 0);
}

function invokeInTen(func) {
  setTimeout(func, 10);
}
