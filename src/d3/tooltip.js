/* global d3 */
const tooltip = {
	show(element, text) {
		d3.select(`#${element} .tooltip`)
			.style('left', `${d3.event.pageX}px`) // dennis
			.style('top', `${d3.event.pageY - 30}px`) // dennis
			.transition()
			.duration(300)
			.style('opacity', 0.8)
			.select('h4')
			.text(text)
	},
	hide(element) {
		d3.select(`#${element} .tooltip`)
			.transition()
			.duration(300)
			.style('opacity', 0)
	}
}

module.exports = tooltip
