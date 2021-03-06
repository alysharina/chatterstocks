const $ = require('jquery-jsdom');
const API_KEY = require('../config.js');

const fetchData = function (url, success, error) {
  $.ajax({
    url: url,
    method: 'GET',
    contentType: 'application/json',
    beforeSend: (xhr) => {
      xhr.setRequestHeader('Authorization', API_KEY);
    },
    success: (stockData) => {
      success(stockData);
    },
    error: (err) => {
      console.log('This error is from fetching the data: ', err);
      error(err);
    }
  });
}

const getCompanyInformation = (ticker, callback) => {
  const url = `https://api.polygon.io/v3/reference/tickers/${ticker}`;
  fetchData(url,
    (stockData) => {
    callback(null, stockData);
    },
    (err) => {
      callback(err);
  });
}

const getCurrentStockPrice = (res, ticker, currentDate, callback) => {
  const currentDateJSON = currentDate.toJSON().substring(0, 10);
  const previousDate = currentDate.getDate() - 1;
  const previousDateJSON = currentDate.toJSON().substring(0, 8) + previousDate;

  const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${previousDateJSON}/${currentDateJSON}?sort=asc&limit=120`;

  fetchData(url,
    (stockData) => {
      console.log(stockData);
      var currentPrice = stockData.results[0].vw;
      callback(null, currentPrice, ticker);
    },
    (err) => {
      callback(err);
  });
}

const getAfterHoursStockPrice = (res, ticker, currentDate, callback) => {
  const currentDateJSON = currentDate.toJSON().substring(0, 10);
  const currentDay = currentDate.getDay();
  let daysSinceLastBusinessDate = 0;

  if (currentDay === 0) {
    daysSinceLastBusinessDate = 2;
  } else if (currentDay === 6) {
    daysSinceLastBusinessDate = 1;
  }

  const lastBusinessDate = currentDate.getDate() - daysSinceLastBusinessDate;
  const lastBusinessDateJSON = currentDate.toJSON().substring(0, 8) + lastBusinessDate;
  console.log(lastBusinessDateJSON)
  const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/prev?adjusted=true`;

  fetchData(url,
    (stockData) => {
      var currentPrice = stockData.results[0].vw;
      console.log(stockData.results)
      callback(null, currentPrice, ticker);
    },
    (err) => {
      callback(err);
  });
}

const getStockPriceAndInfo = (res, ticker, currentDate, getStockPriceFunction, next) => {
  var stockData = {};
  getStockPriceFunction(res, ticker, currentDate, (err, currentPrice, ticker) => {
    if (err === null) {
      stockData.currentPrice = currentPrice;
      getCompanyInformation(ticker, (err, info) => {
        if (err === null) {
          stockData.info = info;
          res.status(200).send(stockData);
        } else {
          next(err);
        }
      });
    } else {
      next(err);
    }
  });
}

exports.getCompanyInformation = getCompanyInformation;
exports.getCurrentStockPrice = getCurrentStockPrice;
exports.getAfterHoursStockPrice = getAfterHoursStockPrice;
exports.getStockPriceAndInfo = getStockPriceAndInfo;