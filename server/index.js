const fs = require('fs')
const path = require('path')
const OBA = require('../api/oba-api.js')
const helper = require('../api/helpers.js')
// require('util').inspect.defaultOptions.depth = 2

require('dotenv').config()

const oba = new OBA({
  key: process.env.PUBLIC
})

oba
  .getMore(
    [
      2001,
      2002,
      2003,
      2004,
      2005,
      2006,
      2007,
      2008,
      2009,
      2010,
      2011,
      2012,
      2013,
      2014,
      2015,
      2016,
      2017
    ],
    {
      q: 'genre:school'
    }
  )
  .then(response => {
    return response
      .reduce((total, year) => total.concat(year), [])
      .reduce(
        (total, page) => total.concat(page.aquabrowser.results[0].result),
        []
      )
  })
  .then(data =>
    data.map(book => ({
      title: book.titles[0].title[0]._,
      author: helper.getAuthor(book),
      year: helper.getYear(book),
      place: helper.getPlace(book),
      publisher: helper.getPublisher(book),
      language: helper.getLanguage(book)
    }))
  )
  .then(data => {
    fs.writeFile(
      path.join(__dirname, '/../static/data/data.json'),
      JSON.stringify(data),
      'utf-8',
      err => {
        if (err) {
          console.log(err)
        } else {
          console.log('File has been created')
        }
      }
    )
  })
  .catch(err => {
    if (err.response) {
      console.log(err.response.status, err.response.statusText)
    } else {
      console.log(err)
    }
  })
