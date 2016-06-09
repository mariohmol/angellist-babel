'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

require('babel-polyfill');

var _co = require('co');

var _co2 = _interopRequireDefault(_co);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _csvParse = require('csv-parse');

var _csvParse2 = _interopRequireDefault(_csvParse);

var _streamTransform = require('stream-transform');

var _streamTransform2 = _interopRequireDefault(_streamTransform);

var _querystring = require('querystring');

var _querystring2 = _interopRequireDefault(_querystring);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var loginData = {
  'authenticity_token': 'DvEfVp8JrbtP9bBLukcfRMblLqf5Ln5djQS3eW2F3M4=',
  'user[email]': process.argv[2],
  'user[password]': process.argv[3],
  'login_only': true
};

var filterData = {
  'filter_data[markets][]': 'Health Care',
  'filter_data[stage]': 'Series A'
};

function requestLogin(formData) {
  console.log(formData);
  return new Promise(function (resolve, reject) {
    try {
      return _request2.default.post('https://angel.co/users/login', { form: formData }).on('error', function (err) {
        return reject(err);
      }).on('response', function (response) {
        console.log(response);resolve(response);
      });
    } catch (err) {
      console.log(err);
      return reject(err);
    }
  });
}

function requestCsv(filterOptions) {
  console.log(filterOptions);
  return new Promise(function (resolve, reject) {
    try {
      var _ret = function () {
        var output = [];
        var parser = (0, _csvParse2.default)({ columns: true, auto_parse: true, trim: true }).on('error', function (err) {
          return reject(err);
        });
        var transfromer = (0, _streamTransform2.default)(function (data) {
          for (var key in data) {
            if (!data.hasOwnProperty(key)) continue;
            data[key.replace(/\s/g, '_').toLowerCase()] = data[key];
            delete data[key];
          }
          console.log(data);
          output.push(data);
          return data;
        }).on('error', function (err) {
          return reject(err);
        }).on('finish', function () {
          return resolve(output);
        });

        var query = _querystring2.default.stringify(filterOptions);
        return {
          v: (0, _request2.default)('https://angel.co/companies/export.csv?' + query).pipe(parser).pipe(transfromer)
        };
      }();

      if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
    } catch (err) {
      return reject(err);
    }
  });
}

(0, _co2.default)(regeneratorRuntime.mark(function _callee() {
  var csv;
  return regeneratorRuntime.wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return requestLogin(loginData);

        case 3:
          _context.next = 5;
          return requestCsv(filterData);

        case 5:
          csv = _context.sent;

          console.log(csv);
          _context.next = 13;
          break;

        case 9:
          _context.prev = 9;
          _context.t0 = _context['catch'](0);

          console.error(_context.t0);
          return _context.abrupt('return');

        case 13:
        case 'end':
          return _context.stop();
      }
    }
  }, _callee, this, [[0, 9]]);
})).catch(errorHandler);

function errorHandler(err) {
  console.log(err.stack);
}
