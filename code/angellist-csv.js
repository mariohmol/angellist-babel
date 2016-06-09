import 'babel-polyfill'
import co from 'co'
import request from 'request'
import parse from 'csv-parse'
import transform from 'stream-transform'
import querystring from 'querystring'

const loginData = {
  'authenticity_token': 'DvEfVp8JrbtP9bBLukcfRMblLqf5Ln5djQS3eW2F3M4=',
  'user[email]': process.argv[2],
  'user[password]': process.argv[3],
  'login_only': true
}

const filterData = {
  'filter_data[markets][]': 'Health Care',
  'filter_data[stage]': 'Series A'
}

function requestLogin (formData) {
  return new Promise((resolve, reject) => {
    try {
      return request
        .post('https://angel.co/users/login', { form: formData })
        .on('error', err => reject(err))
        .on('response', response => resolve(response))
    } catch(err) {
      return reject(err)
    }
  })
}

function requestCsv (filterOptions) {
  return new Promise((resolve, reject) => {
    try {
      const output = []
      const parser = parse({ columns: true, auto_parse: true, trim: true })
        .on('error', err => reject(err))
      const transfromer = transform(data => {
          for (let key in data) {
            if (!data.hasOwnProperty(key)) continue
            data[key.replace(/\s/g, '_').toLowerCase()] = data[key]
            delete data[key]
          }
          output.push(data)
          return data
        })
        .on('error', err => reject(err))
        .on('finish', () => resolve(output))

      const query = querystring.stringify(filterOptions)
      return request(`https://angel.co/companies/export.csv?${query}`)
        .pipe(parser)
        .pipe(transfromer)
    } catch(err) {
      return reject(err)
    }
  })
}

co(function * () {
  try {
    yield requestLogin(loginData)
    const csv = yield requestCsv(filterData)
    console.log(csv)
  } catch(err) {
    console.error(err)
    return
  }
}).catch(errorHandler)

function errorHandler (err) {
  console.log(err.stack)
}
