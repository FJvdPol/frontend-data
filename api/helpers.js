module.exports = {
  countKeyTotals: arr =>
    arr.reduce((obj, b) => {
      obj[b] = ++obj[b] || 1
      return obj
    }, {}),
  getMainKey: objArr =>
    objArr.map(array => (array[0]._ ? array[0]._ : array[0])),
  getLanguage: book =>
    book.languages[0][
      `${
        book.languages[0]['original-language']
          ? 'original-language'
          : 'language'
      }`
    ][0]._,
  getYear: book => book.publication[0].year[0]._
}
