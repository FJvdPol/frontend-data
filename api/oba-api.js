const axios = require('axios')
const convert = require('xml-to-json-promise')

// Based on the oba api by Rijk van Zanten (https://github.com/rijkvanzanten)

class API {
	constructor(options) {
		// Set authentication key dependent on options passed in new OBA instance
		this.key = options.key
	}

	// Parameters will be passed to API.get as an object, so we need to turn the object into a query string
	stringify(object) {
		const keys = Object.keys(object)
		const values = Object.values(object)
		return keys.map((key, i) => `&${key}=${values[i]}`).join('')
	}

	// Possible endpoints: search (needs a 'q' parameter) | details (needs a 'frabl' parameter) | availability (needs a 'frabl' parameter) | holdings/root (no parameters) | refine (needs a 'rctx' parameter) | index/x (where x = facet type)
	// Params: query parameters in object, check api docs for possibilities
	// Some unknown parameters: 'q: table:schooltv' 'q: table:activetickets'
	// Returns a promise resolving in an array
	get(endpoint, params = {}) {
		return new Promise((resolve, reject) => {
			axios
				.get(
					`https://zoeken.oba.nl/api/v1/${endpoint}/?authorization=${
						this.key
					}${this.stringify(params)}`
				)
				.then(res => convert(res.data))
				.then(res => resolve(res.aquabrowser.results[0].result))
				.catch(err => reject(err))
		})
	}

	// New version written with Dennis Wegereef (https://github.com/denniswegereef)
	// Possible endpoints: search (needs a 'q' parameter) | holdings/root (no parameters)
	// Params: query parameters in object, check api docs for possibilities
	// Returns a promise resolving in an array
	getUrls(years, params) {
		const base = 'https://zoeken.oba.nl/api/v1/search/'
		const { key, stringify } = this
		const requestYear = year => {
			const all = []
			let page = 1
			const next = aantalBoeken => {
				all.push(aantalBoeken)
				const amountOfPages = Math.ceil(
					aantalBoeken.aquabrowser.meta[0].count[0] / 20
				)
				if (page < amountOfPages) {
					page++
					return send()
				}
				return all
			}
			const send = () =>
				axios
					.get(
						`${base}?authorization=${key}${stringify(
							params
						)}&facet=pubYear(${year})&refine=true&page=${page}&pagesize=20`
					)
					.then(res => res.data)
					.then(convert.xmlDataToJSON)
					.then(next, console.error)
					.then(res => {
						if (res) {
							return res
						}
					})
			return send()
		}
		return Promise.all(years.map(requestYear))
	}

	getMore(years, params = {}) {
		return new Promise((resolve, reject) => {
			this.getUrls(years, params)
				.then(response => {
					resolve(response)
				})
				.catch(err => {
					reject(err)
				})
		})
	}
}
module.exports = API
