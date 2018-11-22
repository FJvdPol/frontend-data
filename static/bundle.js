(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var state = require('../state.js');

var pie = require('../d3/pie.js');

var bar = require('../d3/bar.js');

var helper = require('../helpers/helper.js');

module.exports = function () {
  Vue.component('loader', {
    props: ['text'],
    template: '<h2>{{ text }}</h2>'
  });
  Vue.component('pie-chart', {
    props: ['data', 'id'],
    mounted: function mounted() {
      pie.draw(this.id, this.data);
    },
    watch: {
      data: function data() {
        pie.update(this.id, this.data);
      }
    },
    template: '<div :id="this.id"></div>'
  });
  Vue.component('bar-chart', {
    props: ['screen', 'data', 'id'],
    mounted: function mounted() {
      bar.draw(this.id, this.data);
    },
    watch: {
      data: function data() {
        bar.update(this.id, this.data);
      },
      screen: function screen() {
        document.querySelector("#".concat(this.id)).innerHTML = '';
        bar.draw(this.id, this.data);
      }
    },
    template: '<div :id="this.id"></div>'
  });
  var app = new Vue({
    el: '#app',
    data: function data() {
      return state;
    },
    methods: {
      changeFilter: function changeFilter(e) {
        helper.filterGenre(e.target.value);
        map.update('map', state.data.cities);
      },
      metadataClass: function metadataClass() {
        if (state.city.name && state.showbar) {
          return 'metadata-holder city';
        } else if (state.city.name) {
          return 'metadata-holder city full';
        }

        return 'metadata-holder';
      }
    }
  });
};

},{"../d3/bar.js":2,"../d3/pie.js":4,"../helpers/helper.js":7,"../state.js":8}],2:[function(require,module,exports){
"use strict";

var tooltip = require('./tooltip.js');

var helper = require('../helpers/helper.js');

var state = require('../state.js');

var bar = {
  margin: {
    top: 20,
    right: 30,
    bottom: 100,
    left: 80
  },
  draw: function draw(element, data) {
    var chart = d3.select("#".concat(element));
    chart.append('div').classed('tooltip', true).style('opacity', 0).append('h4');
    var svg = chart.append('svg').attr('width', this.width()).attr('height', this.height());
    var axis = svg.append('g').classed('axis', true);
    axis.append('g').classed('xAxis', true);
    axis.append('g').classed('yAxis', true); // axis titles: https://bl.ocks.org/d3noob/23e42c8f67210ac6c678db2cd07a747e

    axis.append('text').attr('transform', "rotate(90) translate(".concat(this.height() - this.margin.bottom / 2, ", ").concat(0 - this.width(), ")")).attr('dy', '0.75em').style('text-anchor', 'middle').style('color', 'var(--color-main)').text('Publishers');
    axis.append('text').attr('transform', "rotate(-90) translate(".concat(0 - this.height() / 2 + this.margin.bottom / 2, ", ", 10, ")")).attr('dy', '0.75em').style('text-anchor', 'middle').style('color', 'var(--color-main)').text('Amount of books');
    svg.append('g').classed('parent', true);
    this.update(element, data);
  },
  update: function update(element, data) {
    var _this = this;

    var color = helper.color(data);
    var svg = d3.select("#".concat(element, " svg"));
    var chart = d3.select("#".concat(element, " .parent"));
    var rect = chart.selectAll('rect').data(data); // start source: https://beta.observablehq.com/@mbostock/d3-bar-chart

    var x = d3.scaleBand().domain(data.map(function (d) {
      return d.title;
    })).range([this.margin.left, this.width() - this.margin.right]).padding(0.1);
    var y = d3.scaleLinear().domain([0, d3.max(data, function (d) {
      return d.total;
    })]).nice().range([this.height() - this.margin.bottom, this.margin.top]);

    var xAxis = function xAxis(g) {
      return g.attr('transform', "translate(0,".concat(_this.height() - _this.margin.bottom, ")")).call(d3.axisBottom(x).tickSizeOuter(0)).selectAll('text').attr('y', 0).attr('x', 10).attr('dy', '.35em').attr('transform', 'rotate(90)').style('text-anchor', 'start');
    };

    var yAxis = function yAxis(g) {
      return g.attr('transform', "translate(".concat(_this.margin.left, ",0)")).call(d3.axisLeft(y)).call(function (g) {
        return g.select('.domain').remove();
      });
    };

    svg.select('.xAxis').call(xAxis);
    svg.select('.yAxis').call(yAxis); // end source

    rect.enter().append('rect').attr('title', function (d, i) {
      return d.title;
    }).on('mouseover', function (d) {
      return tooltip.show(element, "".concat(d.title, ": ").concat(d.total, " books"));
    }).on('mouseout', function () {
      return tooltip.hide(element);
    }).style('fill', function (d, i) {
      return color(i);
    }).attr('x', function (d, i) {
      return x(d.title);
    }).attr('y', function (d) {
      return _this.height() - _this.margin.bottom;
    }).attr('height', function () {
      return 0;
    }).attr('width', x.bandwidth()).transition().duration(500).attr('y', function (d) {
      return y(d.total);
    }).attr('height', function (d) {
      return y(0) - y(d.total);
    });
    rect.style('fill', function (d, i) {
      return color(i);
    }).attr('x', function (d, i) {
      return x(d.title);
    }).attr('y', function (d) {
      return _this.height() - _this.margin.bottom;
    }).attr('height', function () {
      return 0;
    }).attr('width', x.bandwidth()).transition().duration(500).attr('y', function (d) {
      return y(d.total);
    }).attr('height', function (d) {
      return y(0) - y(d.total);
    });
    rect.exit().remove();
  },
  height: function height() {
    return this.width() / 2;
  },
  width: function width() {
    return state.fullscreen ? window.innerWidth - 6 * 16 : window.innerWidth / 1.75; // (20 - 3) * 16
  }
};
module.exports = bar;

},{"../helpers/helper.js":7,"../state.js":8,"./tooltip.js":6}],3:[function(require,module,exports){
"use strict";

/* global d3 mapboxgl */
var city = require('./showcity.js');

var tooltip = require('./tooltip.js');

var map = {
  configure: function configure(mapbox) {
    this.mapbox = mapbox;
    city.configure(mapbox);
  },
  create: function create(data, mapbox) {
    var _this = this;

    var mapPointColor = '#BBE4A0'; // Get Mapbox map canvas container // jorditost

    var chart = d3.select(this.mapbox.getCanvasContainer());
    chart.append('div').classed('tooltip', true).style('opacity', 0).append('h4');
    var svg = chart.append('svg');
    svg.append('g').attr('fill', mapPointColor).attr('stroke', mapPointColor);
    this.update('map', data);
    this.move('map'); // Update on map interaction

    this.mapbox.on('viewreset', function () {
      return _this.move('map');
    });
    this.mapbox.on('move', function () {
      return _this.move('map');
    });
    this.mapbox.on('moveend', function () {
      return _this.move('map');
    });
    this.mapbox.on('zoom', function () {
      return _this.move('map');
    });
  },
  move: function move(element) {
    var _this2 = this;

    d3.select("#".concat(element, " g")).selectAll('circle').transition().duration(0).attr('cx', function (d) {
      return _this2.project(d.coords).x;
    }).attr('cy', function (d) {
      return _this2.project(d.coords).y;
    }).attr('r', function (d) {
      return _this2.radius(d.total);
    });
  },
  update: function update(element, data) {
    var _this3 = this;

    var transition = 300;
    var chart = d3.select("#".concat(element, " svg g"));
    var circles = chart.selectAll('circle').data(data);
    circles.transition().duration(transition).attr('r', 0).transition().duration(0).attr('cx', function (d) {
      return _this3.project(d.coords).x;
    }).attr('cy', function (d) {
      return _this3.project(d.coords).y;
    }).transition().duration(transition).attr('r', function (d) {
      return _this3.radius(d.total);
    });
    circles.enter().append('circle').attr('r', 0).attr('cx', function (d) {
      return _this3.project(d.coords).x;
    }).attr('cy', function (d) {
      return _this3.project(d.coords).y;
    }).on('mouseover', function (d) {
      return tooltip.show(element, "".concat(d.key, ": ").concat(d.total, " books"));
    }).on('mouseout', function () {
      return tooltip.hide(element);
    }).on('click', function (d, i, all) {
      tooltip.hide(element);
      city.show(d, i, all);
    }).transition().delay(transition).duration(transition).attr('r', function (d) {
      return _this3.radius(d.total);
    });
    circles.exit().transition().duration(transition).attr('r', 0).remove();
  },
  project: function project(coords) {
    // Project publishers coordinates to the map's current state // jorditost
    return this.mapbox.project(new mapboxgl.LngLat(+coords[0], +coords[1]));
  },
  radius: function radius(amount) {
    var startZoom = 6;
    var minPointSize = 15;
    var radiusExp = (this.mapbox.getZoom() - startZoom) * 0.75 + 1;
    return amount * radiusExp + minPointSize > minPointSize ? Math.sqrt(amount * radiusExp + minPointSize) : Math.sqrt(minPointSize); // Math.sqrt -> https://developers.google.com/maps/documentation/javascript/examples/circle-simple
  }
};
module.exports = map;

},{"./showcity.js":5,"./tooltip.js":6}],4:[function(require,module,exports){
"use strict";

/* global d3 */
var tooltip = require('./tooltip.js');

var helper = require('../helpers/helper.js');

var pie = {
  draw: function draw(element, data) {
    var height = this.width();
    var width = this.width();
    var chart = d3.select("#".concat(element));
    chart.append('div').classed('tooltip', true).style('opacity', 0).append('h4');
    chart.append('svg').attr('width', width).attr('height', height).append('g').classed('parent', true).attr('transform', "translate(".concat(width / 2, ", ").concat(height / 2, ")"));
    this.update(element, data);
  },
  update: function update(element, data) {
    var color = helper.color(data);
    var radius = this.width() / 2; // http://www.cagrimmett.com/til/2016/08/19/d3-pie-chart.html

    var arc = d3.arc().outerRadius(radius).innerRadius(0); // http://www.cagrimmett.com/til/2016/08/19/d3-pie-chart.html

    var pie = d3.pie().sort(null).value(function (d) {
      return d.total;
    });
    var chart = d3.select("#".concat(element, " .parent"));
    var path = chart.selectAll('path').data(pie(data));
    path.enter().append('path').attr('title', function (d, i) {
      return d.data.title;
    }).on('mouseover', function (d) {
      return tooltip.show(element, "".concat(d.data.title, ": ").concat(d.value, " books"));
    }).on('mouseout', function () {
      return tooltip.hide(element);
    }).style('fill', function (d, i) {
      return color(i);
    }) // saves initial arc value // Mike Bostock (https://bl.ocks.org/mbostock/1346410)
    .each(function (d, i, all) {
      return all[i]._current = d;
    }).transition().duration(500).attrTween('d', enterTween);
    path.transition().style('fill', function (d, i) {
      return color(i);
    }).duration(500) // redraw the arcs
    .attrTween('d', arcTween);
    path.exit().remove(); // same as next function but still don't know how to work with next function to go from 0 on enter

    function enterTween(d) {
      d.innerRadius = 0;
      var i = d3.interpolate({
        startAngle: 0,
        endAngle: 0
      }, d);
      return function (t) {
        return arc(i(t));
      };
    } // interpolate between previous endpoint of datapoint arc and new endpoint
    // Mike Bostock (https://bl.ocks.org/mbostock/1346410)


    function arcTween(d) {
      var i = d3.interpolate(this._current, d);
      this._current = i(0);
      return function (t) {
        return arc(i(t));
      };
    }
  },
  // Makes sure the pie charts (which are rendered next to eachother) don't exceed their container limit.
  // On mobile makes sure the charts are half of the viewport with a leftover space of 50 each
  width: function width() {
    return window.innerWidth - 100 > 40 * 16 ? 200 : (window.innerWidth - 100) / 2;
  }
};
module.exports = pie;

},{"../helpers/helper.js":7,"./tooltip.js":6}],5:[function(require,module,exports){
"use strict";

/* global d3 */
var state = require('../state.js');

var city = {
  configure: function configure(mapbox) {
    this.mapbox = mapbox;
  },
  show: function show(city, index, all) {
    state.set('city', {
      name: city.key,
      amount: city.total,
      publishers: city.values.map(function (publisher) {
        return {
          title: publisher.key,
          total: publisher.values.length
        };
      }).sort(function (a, b) {
        return a.total - b.total;
      })
    });
    state.city.publishers.length <= 1 ? state.set('showbar', false) : false; // Make the clicked circle full color

    d3.selectAll('circle').style('opacity', '');
    d3.select(all[index]).style('opacity', 1); // on mobile, put the map center more to the top of the screen to accomodate for the city info div

    var center = window.innerWidth > 40 * 16 ? [city.coords[0], city.coords[1]] : [city.coords[0], city.coords[1] - 0.3];
    this.mapbox.flyTo({
      center: center,
      speed: 0.3,
      curve: 2,
      zoom: 8
    });
  }
};
module.exports = city;

},{"../state.js":8}],6:[function(require,module,exports){
"use strict";

/* global d3 */
var tooltip = {
  show: function show(element, text) {
    d3.select("#".concat(element, " .tooltip")).style('left', "".concat(d3.event.pageX, "px")) // dennis
    .style('top', "".concat(d3.event.pageY - 30, "px")) // dennis
    .transition().duration(300).style('opacity', 0.8).select('h4').text(text);
  },
  hide: function hide(element) {
    d3.select("#".concat(element, " .tooltip")).transition().duration(300).style('opacity', 0);
  }
};
module.exports = tooltip;

},{}],7:[function(require,module,exports){
"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/* global d3 */
var state = require('../state.js');

var helper = {
  // https://github.com/d3/d3-scale#continuous-scales
  // http://www.jeromecukier.net/2011/08/11/d3-scales-and-color/
  color: function color(data) {
    return d3.scaleLinear().domain([0, Math.round(data.length / 2), data.length]).range(['#BBE4A0', '#52A8AF', '#00305C']);
  },
  groupCities: function groupCities(data, coordinates) {
    var cities = d3.nest().key(function (book) {
      return book.publication.place;
    }).key(function (book) {
      return book.publication.publisher;
    }).entries(data).map(function (city) {
      // match equals true if city is in coordinates database
      var match = coordinates.find(function (place) {
        return place.city.toLowerCase() === city.key.toLowerCase();
      });

      if (!match) {
        return null;
      }

      var total = city.values.map(function (publisher) {
        return publisher.values.length;
      }).reduce(function (a, b) {
        return a + b;
      }, 0);
      var coords = [Number(match.lng), Number(match.lat)];
      return _objectSpread({}, city, {
        total: total,
        coords: coords
      });
    }).filter(function (city) {
      return city !== null;
    });
    return cities;
  },
  filterGenre: function filterGenre(genre) {
    var data;

    if (genre === 'all') {
      data = state.data.total;
    } else {
      data = state.data.total.filter(function (book) {
        return book.genres.includes(genre);
      });
    }

    d3.selectAll('circle').style('fill', '').style('stroke', '');
    state.set('city', _objectSpread({}, state.city, {
      name: ''
    }));
    state.set(data, _objectSpread({}, state.data, {
      cities: this.groupCities(data, state.data.coordinates),
      amount: data.length
    }));
  },
  formatData: function formatData(results) {
    var coordinates = results[0].concat(results[1]);
    var hasPublication = results[2].filter(function (book) {
      return book.publication.place && book.publication.publisher;
    }).map(function (book) {
      // Make sure random characters are removed from the publication city name
      book.publication.place = book.publication.place.replace(/[^a-zA-Z,\s]+/g, '').trim().split(',')[0]; // Make sure inconsistencies in naming of publishers get grouped together

      book.publication.publisher = book.publication.publisher.replace(/[^a-zA-Z,\s]+/g, '').replace('Uitgeverij', '').replace('uitgeverij', '').trim().split(',')[0].toLowerCase() // https://joshtronic.com/2016/02/14/how-to-capitalize-the-first-letter-in-a-string-in-javascript/
      .replace(/^\w/, function (c) {
        return c.toUpperCase();
      });
      return book;
    });
    var genres = hasPublication.map(function (book) {
      return book.genres;
    }).reduce(function (total, bookGenres) {
      return total.concat(bookGenres);
    }, []).sort();
    var cities = this.groupCities(hasPublication, coordinates);
    return {
      cities: cities,
      // Here new Set generates an array with only unique values from a different array
      genres: _toConsumableArray(new Set(genres)),
      amount: hasPublication.length,
      total: hasPublication,
      coordinates: coordinates
    };
  }
};
module.exports = helper;

},{"../state.js":8}],8:[function(require,module,exports){
"use strict";

var state = {
  set: function set(property, value) {
    this[property] = value;
  },
  loaded: false,
  currentCity: 0,
  showbar: false,
  fullscreen: false,
  data: {
    genres: [],
    amount: 0,
    cities: [],
    total: []
  },
  city: {
    name: '',
    amount: 0,
    publishers: []
  }
};
module.exports = state;

},{}],9:[function(require,module,exports){
"use strict";

/* global d3 Vue mapboxgl */
var state = require('./state.js');

var map = require('./d3/map.js');

var pie = require('./d3/pie.js');

var helper = require('./helpers/helper.js');

var layout = require('./components/vue.js');

layout();
mapboxgl.accessToken = 'pk.eyJ1IjoiZmp2ZHBvbCIsImEiOiJjam9mcW1hMmUwNm81M3FvOW9vMDM5Mm5iIn0.5xVPYd93TZQEyqchDMNBtw';
var mapbox = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/fjvdpol/cjojwbcm50dkc2rtfo3m4vs6i',
  center: [4.899431, 52.379189],
  zoom: 5,
  pitch: 40,
  minZoom: 2
});
mapbox.on('load', function () {
  Promise.all([d3.csv('data/codesnetherlands.csv'), d3.csv('data/worldcities.csv'), d3.json('data/wouterdata.json')]).then(function (results) {
    state.set('data', helper.formatData(results));
    map.configure(mapbox);
    map.create(state.data.cities);
    state.set('loaded', true);
    mapbox.flyTo({
      zoom: 6,
      speed: 0.4
    });
  }).catch(function (err) {
    console.log(err);
  });
});

},{"./components/vue.js":1,"./d3/map.js":3,"./d3/pie.js":4,"./helpers/helper.js":7,"./state.js":8}]},{},[9])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY29tcG9uZW50cy92dWUuanMiLCJzcmMvZDMvYmFyLmpzIiwic3JjL2QzL21hcC5qcyIsInNyYy9kMy9waWUuanMiLCJzcmMvZDMvc2hvd2NpdHkuanMiLCJzcmMvZDMvdG9vbHRpcC5qcyIsInNyYy9oZWxwZXJzL2hlbHBlci5qcyIsInNyYy9zdGF0ZS5qcyIsImluZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxJQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsYUFBRCxDQUFyQjs7QUFDQSxJQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsY0FBRCxDQUFuQjs7QUFDQSxJQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsY0FBRCxDQUFuQjs7QUFDQSxJQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsc0JBQUQsQ0FBdEI7O0FBRUEsTUFBTSxDQUFDLE9BQVAsR0FBaUIsWUFBTTtBQUN0QixFQUFBLEdBQUcsQ0FBQyxTQUFKLENBQWMsUUFBZCxFQUF3QjtBQUN2QixJQUFBLEtBQUssRUFBRSxDQUFDLE1BQUQsQ0FEZ0I7QUFFdkIsSUFBQSxRQUFRLEVBQUU7QUFGYSxHQUF4QjtBQUtBLEVBQUEsR0FBRyxDQUFDLFNBQUosQ0FBYyxXQUFkLEVBQTJCO0FBQzFCLElBQUEsS0FBSyxFQUFFLENBQUMsTUFBRCxFQUFTLElBQVQsQ0FEbUI7QUFFMUIsSUFBQSxPQUYwQixxQkFFaEI7QUFDVCxNQUFBLEdBQUcsQ0FBQyxJQUFKLENBQVMsS0FBSyxFQUFkLEVBQWtCLEtBQUssSUFBdkI7QUFDQSxLQUp5QjtBQUsxQixJQUFBLEtBQUssRUFBRTtBQUNOLE1BQUEsSUFETSxrQkFDQztBQUNOLFFBQUEsR0FBRyxDQUFDLE1BQUosQ0FBVyxLQUFLLEVBQWhCLEVBQW9CLEtBQUssSUFBekI7QUFDQTtBQUhLLEtBTG1CO0FBVTFCLElBQUEsUUFBUSxFQUFFO0FBVmdCLEdBQTNCO0FB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Q0FBQyxHQUFSLENBQVksR0FBWjtBQUNBLEdBcEJGO0FBcUJBLENBdEJEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY29uc3Qgc3RhdGUgPSByZXF1aXJlKCcuLi9zdGF0ZS5qcycpXHJcbmNvbnN0IHBpZSA9IHJlcXVpcmUoJy4uL2QzL3BpZS5qcycpXHJcbmNvbnN0IGJhciA9IHJlcXVpcmUoJy4uL2QzL2Jhci5qcycpXHJcbmNvbnN0IGhlbHBlciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvaGVscGVyLmpzJylcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gKCkgPT4ge1xyXG5cdFZ1ZS5jb21wb25lbnQoJ2xvYWRlcicsIHtcclxuXHRcdHByb3BzOiBbJ3RleHQnXSxcclxuXHRcdHRlbXBsYXRlOiAnPGgyPnt7IHRleHQgfX08L2gyPidcclxuXHR9KVxyXG5cclxuXHRWdWUuY29tcG9uZW50KCdwaWUtY2hhcnQnLCB7XHJcblx0XHRwcm9wczogWydkYXRhJywgJ2lkJ10sXHJcblx0XHRtb3VudGVkKCkge1xyXG5cdFx0XHRwaWUuZHJhdyh0aGlzLmlkLCB0aGlzLmRhdGEpXHJcblx0XHR9LFxyXG5cdFx0d2F0Y2g6IHtcclxuXHRcdFx0ZGF0YSgpIHtcclxuXHRcdFx0XHRwaWUudXBkYXRlKHRoaXMuaWQsIHRoaXMuZGF0YSlcclxuXHRcdFx0fVxyXG5cdFx0fSxcclxuXHRcdHRlbXBsYXRlOiAnPGRpdiA6aWQ9XCJ0aGlzLmlkXCI+PC9kaXY+J1xyXG5cdH0pXHJcblxyXG5cdFZ1ZS5jb21wb25lbnQoJ2Jhci1jaGFydCcsIHtcclxuXHRcdHByb3BzOiBbJ3NjcmVlbicsICdkYXRhJywgJ2lkJ10sXHJcblx0XHRtb3VudGVkKCkge1xyXG5cdFx0XHRiYXIuZHJhdyh0aGlzLmlkLCB0aGlzLmRhdGEpXHJcblx0XHR9LFxyXG5cdFx0d2F0Y2g6IHtcclxuXHRcdFx0ZGF0YSgpIHtcclxuXHRcdFx0XHRiYXIudXBkYXRlKHRoaXMuaWQsIHRoaXMuZGF0YSlcclxuXHRcdFx0fSxcclxuXHRcdFx0c2NyZWVuKCkge1xyXG5cdFx0XHRcdGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCMke3RoaXMuaWR9YCkuaW5uZXJIVE1MID0gJydcclxuXHRcdFx0XHRiYXIuZHJhdyh0aGlzLmlkLCB0aGlzLmRhdGEpXHJcblx0XHRcdH1cclxuXHRcdH0sXHJcblx0XHR0ZW1wbGF0ZTogJzxkaXYgOmlkPVwidGhpcy5pZFwiPjwvZGl2PidcclxuXHR9KVxyXG5cclxuXHRjb25zdCBhcHAgPSBuZXcgVnVlKHtcclxuXHRcdGVsOiAnI2FwcCcsXHJcblx0XHRkYXRhKCkge1xyXG5cdFx0XHRyZXR1cm4gc3RhdGVcclxuXHRcdH0sXHJcblx0XHRtZXRob2RzOiB7XHJcblx0XHRcdGNoYW5nZUZpbHRlcjogZSA9PiB7XHJcblx0XHRcdFx0aGVscGVyLmZpbHRlckdlbnJlKGUudGFyZ2V0LnZhbHVlKVxyXG5cdFx0XHRcdG1hcC51cGRhdGUoJ21hcCcsIHN0YXRlLmRhdGEuY2l0aWVzKVxyXG5cdFx0XHR9LFxyXG5cdFx0XHRtZXRhZGF0YUNsYXNzOiAoKSA9PiB7XHJcblx0XHRcdFx0aWYgKHN0YXRlLmNpdHkubmFtZSAmJiBzdGF0ZS5zaG93YmFyKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gJ21ldGFkYXRhLWhvbGRlciBjaXR5J1xyXG5cdFx0XHRcdH0gZWxzZSBpZiAoc3RhdGUuY2l0eS5uYW1lKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gJ21ldGFkYXRhLWhvbGRlciBjaXR5IGZ1bGwnXHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdHJldHVybiAnbWV0YWRhdGEtaG9sZGVyJ1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fSlcclxufVxyXG4iLCJjb25zdCB0b29sdGlwID0gcmVxdWlyZSgnLi90b29sdGlwLmpzJylcclxuY29uc3QgaGVscGVyID0gcmVxdWlyZSgnLi4vaGVscGVycy9oZWxwZXIuanMnKVxyXG5jb25zdCBzdGF0ZSA9IHJlcXVpcmUoJy4uL3N0YXRlLmpzJylcclxuXHJcbmNvbnN0IGJhciA9IHtcclxuXHRtYXJnaW46IHsgdG9wOiAyMCwgcmlnaHQ6IDMwLCBib3R0b206IDEwMCwgbGVmdDogODAgfSxcclxuXHJcblx0ZHJhdyhlbGVtZW50LCBkYXRhKSB7XHJcblx0XHRjb25zdCBjaGFydCA9IGQzLnNlbGVjdChgIyR7ZWxlbWVudH1gKVxyXG5cclxuXHRcdGNoYXJ0XHJcblx0XHRcdC5hcHBlbmQoJ2RpdicpXHJcblx0XHRcdC5jbGFzc2VkKCd0b29sdGlwJywgdHJ1ZSlcclxuXHRcdFx0LnN0eWxlKCdvcGFjaXR5JywgMClcclxuXHRcdFx0LmFwcGVuZCgnaDQnKVxyXG5cclxuXHRcdGNvbnN0IHN2ZyA9IGNoYXJ0XHJcblx0XHRcdC5hcHBlbmQoJ3N2ZycpXHJcblx0XHRcdC5hdHRyKCd3aWR0aCcsIHRoaXMud2lkdGgoKSlcclxuXHRcdFx0LmF0dHIoJ2hlaWdodCcsIHRoaXMuaGVpZ2h0KCkpXHJcblxyXG5cdFx0Y29uc3QgYXhpcyA9IHN2Z1xyXG5cdFx0XHQuYXBwZW5kKCdnJylcclxuXHRcdFx0LmNsYXNzZWQoJ2F4aXMnLCB0cnVlKVxyXG5cclxuXHRcdGF4aXNcclxuXHRcdFx0LmFwcGVuZCgnZycpXHJcblx0XHRcdC5jbGFzc2VkKCd4QXhpcycsIHRydWUpXHJcblxyXG5cdFx0YXhpc1xyXG5cdFx0XHQuYXBwZW5kKCdnJylcclxuXHRcdFx0LmNsYXNzZWQoJ3lBeGlzJywgdHJ1ZSlcclxuXHJcblx0XHQvLyBheGlzIHRpdGxlczogaHR0cHM6Ly9ibC5vY2tzLm9yZy9kM25vb2IvMjNlNDJjOGY2NzIxMGFjNmM2NzhkYjJjZDA3YTc0N2VcclxuXHRcdGF4aXNcclxuXHRcdFx0LmFwcGVuZCgndGV4dCcpXHJcblx0XHRcdC5hdHRyKFxyXG5cdFx0XHRcdCd0cmFuc2Zvcm0nLFxyXG5cdFx0XHRcdGByb3RhdGUoOTApIHRyYW5zbGF0ZSgke3RoaXMuaGVpZ2h0KCkgLSB0aGlzLm1hcmdpbi5ib3R0b20gLyAyfSwgJHswIC0gdGhpcy53aWR0aCgpfSlgXHJcblx0XHRcdClcclxuXHRcdFx0LmF0dHIoJ2R5JywgJzAuNzVlbScpXHJcblx0XHRcdC5zdHlsZSgndGV4dC1hbmNob3InLCAnbWlkZGxlJylcclxuXHRcdFx0LnN0eWxlKCdjb2xvcicsICd2YXIoLS1jb2xvci1tYWluKScpXHJcblx0XHRcdC50ZXh0KCdQdWJsaXNoZXJzJylcclxuXHJcblx0XHRheGlzXHJcblx0XHRcdC5hcHBlbmQoJ3RleHQnKVxyXG5cdFx0XHQuYXR0cihcclxuXHRcdFx0XHQndHJhbnNmb3JtJyxcclxuXHRcdFx0XHRgcm90YXRlKC05MCkgdHJhbnNsYXRlKCR7MCAtIHRoaXMuaGVpZ2h0KCkgLyAyICsgdGhpcy5tYXJnaW4uYm90dG9tIC8gMn0sICR7MTB9KWBcclxuXHRcdFx0KVxyXG5cdFx0XHQuYXR0cignZHknLCAnMC43NWVtJylcclxuXHRcdFx0LnN0eWxlKCd0ZXh0LWFuY2hvcicsICdtaWRkbGUnKVxyXG5cdFx0XHQuc3R5bGUoJ2NvbG9yJywgJ3ZhcigtLWNvbG9yLW1haW4pJylcclxuXHRcdFx0LnRleHQoJ0Ftb3VudCBvZiBib29rcycpXHJcblxyXG5cdFx0c3ZnLmFwcGVuZCgnZycpLmNsYXNzZWQoJ3BhcmVudCcsIHRydWUpXHJcblxyXG5cdFx0dGhpcy51cGRhdGUoZWxlbWVudCwgZGF0YSlcclxuXHR9LFxyXG5cclxuXHR1cGRhdGUoZWxlbWVudCwgZGF0YSkge1xyXG5cdFx0Y29uc3QgY29sb3IgPSBoZWxwZXIuY29sb3IoZGF0YSlcclxuXHJcblx0XHRjb25zdCBzdmcgPSBkMy5zZWxlY3QoYCMke2VsZW1lbnR9IHN2Z2ApXHJcblxyXG5cdFx0Y29uc3QgY2hhcnQgPSBkMy5zZWxlY3QoYCMke2VsZW1lbnR9IC5wYXJlbnRgKVxyXG5cclxuXHRcdGNvbnN0IHJlY3QgPSBjaGFydC5zZWxlY3RBbGwoJ3JlY3QnKS5kYXRhKGRhdGEpXHJcblxyXG5cdFx0Ly8gc3RhcnQgc291cmNlOiBodHRwczovL2JldGEub2JzZXJ2YWJsZWhxLmNvbS9AbWJvc3RvY2svZDMtYmFyLWNoYXJ0XHJcblx0XHRjb25zdCB4ID0gZDNcclxuXHRcdFx0LnNjYWxlQmFuZCgpXHJcblx0XHRcdC5kb21haW4oZGF0YS5tYXAoZCA9PiBkLnRpdGxlKSlcclxuXHRcdFx0LnJhbmdlKFt0aGlzLm1hcmdpbi5sZWZ0LCB0aGlzLndpZHRoKCkgLSB0aGlzLm1hcmdpbi5yaWdodF0pXHJcblx0XHRcdC5wYWRkaW5nKDAuMSlcclxuXHJcblx0XHRjb25zdCB5ID0gZDNcclxuXHRcdFx0LnNjYWxlTGluZWFyKClcclxuXHRcdFx0LmRvbWFpbihbMCwgZDMubWF4KGRhdGEsIGQgPT4gZC50b3RhbCldKVxyXG5cdFx0XHQubmljZSgpXHJcblx0XHRcdC5yYW5nZShbdGhpcy5oZWlnaHQoKSAtIHRoaXMubWFyZ2luLmJvdHRvbSwgdGhpcy5tYXJnaW4udG9wXSlcclxuXHJcblx0XHRjb25zdCB4QXhpcyA9IGcgPT5cclxuXHRcdFx0Z1xyXG5cdFx0XHRcdC5hdHRyKCd0cmFuc2Zvcm0nLCBgdHJhbnNsYXRlKDAsJHt0aGlzLmhlaWdodCgpIC0gdGhpcy5tYXJnaW4uYm90dG9tfSlgKVxyXG5cdFx0XHRcdC5jYWxsKGQzLmF4aXNCb3R0b20oeCkudGlja1NpemVPdXRlcigwKSlcclxuXHRcdFx0XHQuc2VsZWN0QWxsKCd0ZXh0JylcclxuXHRcdFx0XHQuYXR0cigneScsIDApXHJcblx0XHRcdFx0LmF0dHIoJ3gnLCAxMClcclxuXHRcdFx0XHQuYXR0cignZHknLCAnLjM1ZW0nKVxyXG5cdFx0XHRcdC5hdHRyKCd0cmFuc2Zvcm0nLCAncm90YXRlKDkwKScpXHJcblx0XHRcdFx0LnN0eWxlKCd0ZXh0LWFuY2hvcicsICdzdGFydCcpXHJcblxyXG5cdFx0Y29uc3QgeUF4aXMgPSBnID0+XHJcblx0XHRcdGdcclxuXHRcdFx0XHQuYXR0cigndHJhbnNmb3JtJywgYHRyYW5zbGF0ZSgke3RoaXMubWFyZ2luLmxlZnR9LDApYClcclxuXHRcdFx0XHQuY2FsbChkMy5heGlzTGVmdCh5KSlcclxuXHRcdFx0XHQuY2FsbChnID0+IGcuc2VsZWN0KCcuZG9tYWluJykucmVtb3ZlKCkpXHJcblxyXG5cdFx0c3ZnLnNlbGVjdCgnLnhBeGlzJykuY2FsbCh4QXhpcylcclxuXHJcblx0XHRzdmcuc2VsZWN0KCcueUF4aXMnKS5jYWxsKHlBeGlzKVxyXG5cdFx0Ly8gZW5kIHNvdXJjZVxyXG5cclxuXHRcdHJlY3RcclxuXHRcdFx0LmVudGVyKClcclxuXHRcdFx0LmFwcGVuZCgncmVjdCcpXHJcblx0XHRcdC5hdHRyKCd0aXRsZScsIChkLCBpKSA9PiBkLnRpdGxlKVxyXG5cdFx0XHQub24oJ21vdXNlb3ZlcicsIGQgPT5cclxuXHRcdFx0XHR0b29sdGlwLnNob3coZWxlbWVudCwgYCR7ZC50aXRsZX06ICR7ZC50b3RhbH0gYm9va3NgKVxyXG5cdFx0XHQpXHJcblx0XHRcdC5vbignbW91c2VvdXQnLCAoKSA9PiB0b29sdGlwLmhpZGUoZWxlbWVudCkpXHJcblx0XHRcdC5zdHlsZSgnZmlsbCcsIChkLCBpKSA9PiBjb2xvcihpKSlcclxuXHRcdFx0LmF0dHIoJ3gnLCAoZCwgaSkgPT4geChkLnRpdGxlKSlcclxuXHRcdFx0LmF0dHIoJ3knLCBkID0+IHRoaXMuaGVpZ2h0KCkgLSB0aGlzLm1hcmdpbi5ib3R0b20pXHJcblx0XHRcdC5hdHRyKCdoZWlnaHQnLCAoKSA9PiAwKVxyXG5cdFx0XHQuYXR0cignd2lkdGgnLCB4LmJhbmR3aWR0aCgpKVxyXG5cdFx0XHQudHJhbnNpdGlvbigpXHJcblx0XHRcdC5kdXJhdGlvbig1MDApXHJcblx0XHRcdC5hdHRyKCd5JywgZCA9PiB5KGQudG90YWwpKVxyXG5cdFx0XHQuYXR0cignaGVpZ2h0JywgZCA9PiB5KDApIC0geShkLnRvdGFsKSlcclxuXHJcblx0XHRyZWN0XHJcblx0XHRcdC5zdHlsZSgnZmlsbCcsIChkLCBpKSA9PiBjb2xvcihpKSlcclxuXHRcdFx0LmF0dHIoJ3gnLCAoZCwgaSkgPT4geChkLnRpdGxlKSlcclxuXHRcdFx0LmF0dHIoJ3knLCBkID0+IHRoaXMuaGVpZ2h0KCkgLSB0aGlzLm1hcmdpbi5ib3R0b20pXHJcblx0XHRcdC5hdHRyKCdoZWlnaHQnLCAoKSA9PiAwKVxyXG5cdFx0XHQuYXR0cignd2lkdGgnLCB4LmJhbmR3aWR0aCgpKVxyXG5cdFx0XHQudHJhbnNpdGlvbigpXHJcblx0XHRcdC5kdXJhdGlvbig1MDApXHJcblx0XHRcdC5hdHRyKCd5JywgZCA9PiB5KGQudG90YWwpKVxyXG5cdFx0XHQuYXR0cignaGVpZ2h0JywgZCA9PiB5KDApIC0geShkLnRvdGFsKSlcclxuXHJcblx0XHRyZWN0LmV4aXQoKS5yZW1vdmUoKVxyXG5cdH0sXHJcblxyXG5cdGhlaWdodCgpIHtcclxuXHRcdHJldHVybiB0aGlzLndpZHRoKCkgLyAyXHJcblx0fSxcclxuXHJcblx0d2lkdGgoKSB7XHJcblx0XHRyZXR1cm4gc3RhdGUuZnVsbHNjcmVlbiA/IHdpbmRvdy5pbm5lcldpZHRoIC0gNiAqIDE2IDogd2luZG93LmlubmVyV2lkdGggLyAxLjc1IC8vICgyMCAtIDMpICogMTZcclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gYmFyXHJcbiIsIi8qIGdsb2JhbCBkMyBtYXBib3hnbCAqL1xyXG5jb25zdCBjaXR5ID0gcmVxdWlyZSgnLi9zaG93Y2l0eS5qcycpXHJcbmNvbnN0IHRvb2x0aXAgPSByZXF1aXJlKCcuL3Rvb2x0aXAuanMnKVxyXG5cclxuY29uc3QgbWFwID0ge1xyXG5cdGNvbmZpZ3VyZShtYXBib3gpIHtcclxuXHRcdHRoaXMubWFwYm94ID0gbWFwYm94XHJcblx0XHRjaXR5LmNvbmZpZ3VyZShtYXBib3gpXHJcblx0fSxcclxuXHRjcmVhdGUoZGF0YSwgbWFwYm94KSB7XHJcblx0XHRjb25zdCBtYXBQb2ludENvbG9yID0gJyNCQkU0QTAnXHJcblxyXG5cdFx0Ly8gR2V0IE1hcGJveCBtYXAgY2FudmFzIGNvbnRhaW5lciAvLyBqb3JkaXRvc3RcclxuXHRcdGNvbnN0IGNoYXJ0ID0gZDMuc2VsZWN0KHRoaXMubWFwYm94LmdldENhbnZhc0NvbnRhaW5lcigpKVxyXG5cclxuXHRcdGNoYXJ0XHJcblx0XHRcdC5hcHBlbmQoJ2RpdicpXHJcblx0XHRcdC5jbGFzc2VkKCd0b29sdGlwJywgdHJ1ZSlcclxuXHRcdFx0LnN0eWxlKCdvcGFjaXR5JywgMClcclxuXHRcdFx0LmFwcGVuZCgnaDQnKVxyXG5cclxuXHRcdGNvbnN0IHN2ZyA9IGNoYXJ0LmFwcGVuZCgnc3ZnJylcclxuXHJcblx0XHRzdmdcclxuXHRcdFx0LmFwcGVuZCgnZycpXHJcblx0XHRcdC5hdHRyKCdmaWxsJywgbWFwUG9pbnRDb2xvcilcclxuXHRcdFx0LmF0dHIoJ3N0cm9rZScsIG1hcFBvaW50Q29sb3IpXHJcblxyXG5cdFx0dGhpcy51cGRhdGUoJ21hcCcsIGRhdGEpXHJcblxyXG5cdFx0dGhpcy5tb3ZlKCdtYXAnKVxyXG5cclxuXHRcdC8vIFVwZGF0ZSBvbiBtYXAgaW50ZXJhY3Rpb25cclxuXHRcdHRoaXMubWFwYm94Lm9uKCd2aWV3cmVzZXQnLCAoKSA9PiB0aGlzLm1vdmUoJ21hcCcpKVxyXG5cdFx0dGhpcy5tYXBib3gub24oJ21vdmUnLCAoKSA9PiB0aGlzLm1vdmUoJ21hcCcpKVxyXG5cdFx0dGhpcy5tYXBib3gub24oJ21vdmVlbmQnLCAoKSA9PiB0aGlzLm1vdmUoJ21hcCcpKVxyXG5cdFx0dGhpcy5tYXBib3gub24oJ3pvb20nLCAoKSA9PiB0aGlzLm1vdmUoJ21hcCcpKVxyXG5cdH0sXHJcblxyXG5cdG1vdmUoZWxlbWVudCkge1xyXG5cdFx0ZDMuc2VsZWN0KGAjJHtlbGVtZW50fSBnYClcclxuXHRcdFx0LnNlbGVjdEFsbCgnY2lyY2xlJylcclxuXHRcdFx0LnRyYW5zaXRpb24oKVxyXG5cdFx0XHQuZHVyYXRpb24oMClcclxuXHRcdFx0LmF0dHIoJ2N4JywgZCA9PiB0aGlzLnByb2plY3QoZC5jb29yZHMpLngpXHJcblx0XHRcdC5hdHRyKCdjeScsIGQgPT4gdGhpcy5wcm9qZWN0KGQuY29vcmRzKS55KVxyXG5cdFx0XHQuYXR0cigncicsIGQgPT4gdGhpcy5yYWRpdXMoZC50b3RhbCkpXHJcblx0fSxcclxuXHJcblx0dXBkYXRlKGVsZW1lbnQsIGRhdGEpIHtcclxuXHRcdGNvbnN0IHRyYW5zaXRpb24gPSAzMDBcclxuXHJcblx0XHRjb25zdCBjaGFydCA9IGQzLnNlbGVjdChgIyR7ZWxlbWVudH0gc3ZnIGdgKVxyXG5cclxuXHRcdGNvbnN0IGNpcmNsZXMgPSBjaGFydC5zZWxlY3RBbGwoJ2NpcmNsZScpLmRhdGEoZGF0YSlcclxuXHJcblx0XHRjaXJjbGVzXHJcblx0XHRcdC50cmFuc2l0aW9uKClcclxuXHRcdFx0LmR1cmF0aW9uKHRyYW5zaXRpb24pXHJcblx0XHRcdC5hdHRyKCdyJywgMClcclxuXHRcdFx0LnRyYW5zaXRpb24oKVxyXG5cdFx0XHQuZHVyYXRpb24oMClcclxuXHRcdFx0LmF0dHIoJ2N4JywgZCA9PiB0aGlzLnByb2plY3QoZC5jb29yZHMpLngpXHJcblx0XHRcdC5hdHRyKCdjeScsIGQgPT4gdGhpcy5wcm9qZWN0KGQuY29vcmRzKS55KVxyXG5cdFx0XHQudHJhbnNpdGlvbigpXHJcblx0XHRcdC5kdXJhdGlvbih0cmFuc2l0aW9uKVxyXG5cdFx0XHQuYXR0cigncicsIGQgPT4gdGhpcy5yYWRpdXMoZC50b3RhbCkpXHJcblxyXG5cdFx0Y2lyY2xlc1xyXG5cdFx0XHQuZW50ZXIoKVxyXG5cdFx0XHQuYXBwZW5kKCdjaXJjbGUnKVxyXG5cdFx0XHQuYXR0cigncicsIDApXHJcblx0XHRcdC5hdHRyKCdjeCcsIGQgPT4gdGhpcy5wcm9qZWN0KGQuY29vcmRzKS54KVxyXG5cdFx0XHQuYXR0cignY3knLCBkID0+IHRoaXMucHJvamVjdChkLmNvb3JkcykueSlcclxuXHRcdFx0Lm9uKCdtb3VzZW92ZXInLCBkID0+IHRvb2x0aXAuc2hvdyhlbGVtZW50LCBgJHtkLmtleX06ICR7ZC50b3RhbH0gYm9va3NgKSlcclxuXHRcdFx0Lm9uKCdtb3VzZW91dCcsICgpID0+IHRvb2x0aXAuaGlkZShlbGVtZW50KSlcclxuXHRcdFx0Lm9uKCdjbGljaycsIChkLCBpLCBhbGwpID0+IHtcclxuXHRcdFx0XHR0b29sdGlwLmhpZGUoZWxlbWVudClcclxuXHRcdFx0XHRjaXR5LnNob3coZCwgaSwgYWxsKVxyXG5cdFx0XHR9KVxyXG5cdFx0XHQudHJhbnNpdGlvbigpXHJcblx0XHRcdC5kZWxheSh0cmFuc2l0aW9uKVxyXG5cdFx0XHQuZHVyYXRpb24odHJhbnNpdGlvbilcclxuXHRcdFx0LmF0dHIoJ3InLCBkID0+IHRoaXMucmFkaXVzKGQudG90YWwpKVxyXG5cclxuXHRcdGNpcmNsZXNcclxuXHRcdFx0LmV4aXQoKVxyXG5cdFx0XHQudHJhbnNpdGlvbigpXHJcblx0XHRcdC5kdXJhdGlvbih0cmFuc2l0aW9uKVxyXG5cdFx0XHQuYXR0cigncicsIDApXHJcblx0XHRcdC5yZW1vdmUoKVxyXG5cdH0sXHJcblxyXG5cdHByb2plY3QoY29vcmRzKSB7XHJcblx0XHQvLyBQcm9qZWN0IHB1Ymxpc2hlcnMgY29vcmRpbmF0ZXMgdG8gdGhlIG1hcCdzIGN1cnJlbnQgc3RhdGUgLy8gam9yZGl0b3N0XHJcblx0XHRyZXR1cm4gdGhpcy5tYXBib3gucHJvamVjdChuZXcgbWFwYm94Z2wuTG5nTGF0KCtjb29yZHNbMF0sICtjb29yZHNbMV0pKVxyXG5cdH0sXHJcblxyXG5cdHJhZGl1cyhhbW91bnQpIHtcclxuXHRcdGNvbnN0IHN0YXJ0Wm9vbSA9IDZcclxuXHRcdGNvbnN0IG1pblBvaW50U2l6ZSA9IDE1XHJcblx0XHRjb25zdCByYWRpdXNFeHAgPSAodGhpcy5tYXBib3guZ2V0Wm9vbSgpIC0gc3RhcnRab29tKSAqIDAuNzUgKyAxXHJcblx0XHRyZXR1cm4gYW1vdW50ICogcmFkaXVzRXhwICsgbWluUG9pbnRTaXplID4gbWluUG9pbnRTaXplXHJcblx0XHRcdD8gTWF0aC5zcXJ0KGFtb3VudCAqIHJhZGl1c0V4cCArIG1pblBvaW50U2l6ZSlcclxuXHRcdFx0OiBNYXRoLnNxcnQobWluUG9pbnRTaXplKVxyXG5cdFx0Ly8gTWF0aC5zcXJ0IC0+IGh0dHBzOi8vZGV2ZWxvcGVycy5nb29nbGUuY29tL21hcHMvZG9jdW1lbnRhdGlvbi9qYXZhc2NyaXB0L2V4YW1wbGVzL2NpcmNsZS1zaW1wbGVcclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gbWFwXHJcbiIsIi8qIGdsb2JhbCBkMyAqL1xyXG5jb25zdCB0b29sdGlwID0gcmVxdWlyZSgnLi90b29sdGlwLmpzJylcclxuY29uc3QgaGVscGVyID0gcmVxdWlyZSgnLi4vaGVscGVycy9oZWxwZXIuanMnKVxyXG5cclxuY29uc3QgcGllID0ge1xyXG5cdGRyYXcoZWxlbWVudCwgZGF0YSkge1xyXG5cdFx0Y29uc3QgaGVpZ2h0ID0gdGhpcy53aWR0aCgpXHJcblx0XHRjb25zdCB3aWR0aCA9IHRoaXMud2lkdGgoKVxyXG5cclxuXHRcdGNvbnN0IGNoYXJ0ID0gZDMuc2VsZWN0KGAjJHtlbGVtZW50fWApXHJcblxyXG5cdFx0Y2hhcnRcclxuXHRcdFx0LmFwcGVuZCgnZGl2JylcclxuXHRcdFx0LmNsYXNzZWQoJ3Rvb2x0aXAnLCB0cnVlKVxyXG5cdFx0XHQuc3R5bGUoJ29wYWNpdHknLCAwKVxyXG5cdFx0XHQuYXBwZW5kKCdoNCcpXHJcblxyXG5cdFx0Y2hhcnRcclxuXHRcdFx0LmFwcGVuZCgnc3ZnJylcclxuXHRcdFx0LmF0dHIoJ3dpZHRoJywgd2lkdGgpXHJcblx0XHRcdC5hdHRyKCdoZWlnaHQnLCBoZWlnaHQpXHJcblx0XHRcdC5hcHBlbmQoJ2cnKVxyXG5cdFx0XHQuY2xhc3NlZCgncGFyZW50JywgdHJ1ZSlcclxuXHRcdFx0LmF0dHIoJ3RyYW5zZm9ybScsIGB0cmFuc2xhdGUoJHt3aWR0aCAvIDJ9LCAke2hlaWdodCAvIDJ9KWApXHJcblxyXG5cdFx0dGhpcy51cGRhdGUoZWxlbWVudCwgZGF0YSlcclxuXHR9LFxyXG5cclxuXHR1cGRhdGUoZWxlbWVudCwgZGF0YSkge1xyXG5cdFx0Y29uc3QgY29sb3IgPSBoZWxwZXIuY29sb3IoZGF0YSlcclxuXHJcblx0XHRjb25zdCByYWRpdXMgPSB0aGlzLndpZHRoKCkgLyAyXHJcblxyXG5cdFx0Ly8gaHR0cDovL3d3dy5jYWdyaW1tZXR0LmNvbS90aWwvMjAxNi8wOC8xOS9kMy1waWUtY2hhcnQuaHRtbFxyXG5cdFx0Y29uc3QgYXJjID0gZDNcclxuXHRcdFx0LmFyYygpXHJcblx0XHRcdC5vdXRlclJhZGl1cyhyYWRpdXMpXHJcblx0XHRcdC5pbm5lclJhZGl1cygwKVxyXG5cclxuXHRcdC8vIGh0dHA6Ly93d3cuY2FncmltbWV0dC5jb20vdGlsLzIwMTYvMDgvMTkvZDMtcGllLWNoYXJ0Lmh0bWxcclxuXHRcdGNvbnN0IHBpZSA9IGQzXHJcblx0XHRcdC5waWUoKVxyXG5cdFx0XHQuc29ydChudWxsKVxyXG5cdFx0XHQudmFsdWUoZCA9PiBkLnRvdGFsKVxyXG5cclxuXHRcdGNvbnN0IGNoYXJ0ID0gZDMuc2VsZWN0KGAjJHtlbGVtZW50fSAucGFyZW50YClcclxuXHJcblx0XHRjb25zdCBwYXRoID0gY2hhcnQuc2VsZWN0QWxsKCdwYXRoJykuZGF0YShwaWUoZGF0YSkpXHJcblxyXG5cdFx0cGF0aFxyXG5cdFx0XHQuZW50ZXIoKVxyXG5cdFx0XHQuYXBwZW5kKCdwYXRoJylcclxuXHRcdFx0LmF0dHIoJ3RpdGxlJywgKGQsIGkpID0+IGQuZGF0YS50aXRsZSlcclxuXHRcdFx0Lm9uKCdtb3VzZW92ZXInLCBkID0+XHJcblx0XHRcdFx0dG9vbHRpcC5zaG93KGVsZW1lbnQsIGAke2QuZGF0YS50aXRsZX06ICR7ZC52YWx1ZX0gYm9va3NgKVxyXG5cdFx0XHQpXHJcblx0XHRcdC5vbignbW91c2VvdXQnLCAoKSA9PiB0b29sdGlwLmhpZGUoZWxlbWVudCkpXHJcblx0XHRcdC5zdHlsZSgnZmlsbCcsIChkLCBpKSA9PiBjb2xvcihpKSlcclxuXHRcdFx0Ly8gc2F2ZXMgaW5pdGlhbCBhcmMgdmFsdWUgLy8gTWlrZSBCb3N0b2NrIChodHRwczovL2JsLm9ja3Mub3JnL21ib3N0b2NrLzEzNDY0MTApXHJcblx0XHRcdC5lYWNoKChkLCBpLCBhbGwpID0+IChhbGxbaV0uX2N1cnJlbnQgPSBkKSlcclxuXHRcdFx0LnRyYW5zaXRpb24oKVxyXG5cdFx0XHQuZHVyYXRpb24oNTAwKVxyXG5cdFx0XHQuYXR0clR3ZWVuKCdkJywgZW50ZXJUd2VlbilcclxuXHJcblx0XHRwYXRoXHJcblx0XHRcdC50cmFuc2l0aW9uKClcclxuXHRcdFx0LnN0eWxlKCdmaWxsJywgKGQsIGkpID0+IGNvbG9yKGkpKVxyXG5cdFx0XHQuZHVyYXRpb24oNTAwKVxyXG5cdFx0XHQvLyByZWRyYXcgdGhlIGFyY3NcclxuXHRcdFx0LmF0dHJUd2VlbignZCcsIGFyY1R3ZWVuKVxyXG5cclxuXHRcdHBhdGguZXhpdCgpLnJlbW92ZSgpXHJcblxyXG5cdFx0Ly8gc2FtZSBhcyBuZXh0IGZ1bmN0aW9uIGJ1dCBzdGlsbCBkb24ndCBrbm93IGhvdyB0byB3b3JrIHdpdGggbmV4dCBmdW5jdGlvbiB0byBnbyBmcm9tIDAgb24gZW50ZXJcclxuXHRcdGZ1bmN0aW9uIGVudGVyVHdlZW4oZCkge1xyXG5cdFx0XHRkLmlubmVyUmFkaXVzID0gMFxyXG5cdFx0XHR2YXIgaSA9IGQzLmludGVycG9sYXRlKHsgc3RhcnRBbmdsZTogMCwgZW5kQW5nbGU6IDAgfSwgZClcclxuXHRcdFx0cmV0dXJuIHQgPT4gYXJjKGkodCkpXHJcblx0XHR9XHJcblx0XHQvLyBpbnRlcnBvbGF0ZSBiZXR3ZWVuIHByZXZpb3VzIGVuZHBvaW50IG9mIGRhdGFwb2ludCBhcmMgYW5kIG5ldyBlbmRwb2ludFxyXG5cdFx0Ly8gTWlrZSBCb3N0b2NrIChodHRwczovL2JsLm9ja3Mub3JnL21ib3N0b2NrLzEzNDY0MTApXHJcblx0XHRmdW5jdGlvbiBhcmNUd2VlbihkKSB7XHJcblx0XHRcdGNvbnN0IGkgPSBkMy5pbnRlcnBvbGF0ZSh0aGlzLl9jdXJyZW50LCBkKVxyXG5cdFx0XHR0aGlzLl9jdXJyZW50ID0gaSgwKVxyXG5cdFx0XHRyZXR1cm4gdCA9PiBhcmMoaSh0KSlcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHQvLyBNYWtlcyBzdXJlIHRoZSBwaWUgY2hhcnRzICh3aGljaCBhcmUgcmVuZGVyZWQgbmV4dCB0byBlYWNob3RoZXIpIGRvbid0IGV4Y2VlZCB0aGVpciBjb250YWluZXIgbGltaXQuXHJcblx0Ly8gT24gbW9iaWxlIG1ha2VzIHN1cmUgdGhlIGNoYXJ0cyBhcmUgaGFsZiBvZiB0aGUgdmlld3BvcnQgd2l0aCBhIGxlZnRvdmVyIHNwYWNlIG9mIDUwIGVhY2hcclxuXHR3aWR0aCgpIHtcclxuXHRcdHJldHVybiB3aW5kb3cuaW5uZXJXaWR0aCAtIDEwMCA+IDQwICogMTZcclxuXHRcdFx0PyAyMDBcclxuXHRcdFx0OiAod2luZG93LmlubmVyV2lkdGggLSAxMDApIC8gMlxyXG5cdH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBwaWVcclxuIiwiLyogZ2xvYmFsIGQzICovXHJcbmNvbnN0IHN0YXRlID0gcmVxdWlyZSgnLi4vc3RhdGUuanMnKVxyXG5cclxuY29uc3QgY2l0eSA9IHtcclxuXHRjb25maWd1cmUobWFwYm94KSB7XHJcblx0XHR0aGlzLm1hcGJveCA9IG1hcGJveFxyXG5cdH0sXHJcblx0c2hvdyhjaXR5LCBpbmRleCwgYWxsKSB7XHJcblx0XHRzdGF0ZS5zZXQoJ2NpdHknLCB7XHJcblx0XHRcdG5hbWU6IGNpdHkua2V5LFxyXG5cdFx0XHRhbW91bnQ6IGNpdHkudG90YWwsXHJcblx0XHRcdHB1Ymxpc2hlcnM6IGNpdHkudmFsdWVzXHJcblx0XHRcdFx0Lm1hcChwdWJsaXNoZXIgPT4gKHtcclxuXHRcdFx0XHRcdHRpdGxlOiBwdWJsaXNoZXIua2V5LFxyXG5cdFx0XHRcdFx0dG90YWw6IHB1Ymxpc2hlci52YWx1ZXMubGVuZ3RoXHJcblx0XHRcdFx0fSkpXHJcblx0XHRcdFx0LnNvcnQoKGEsIGIpID0+IGEudG90YWwgLSBiLnRvdGFsKVxyXG5cdFx0fSlcclxuXHJcblx0XHRzdGF0ZS5jaXR5LnB1Ymxpc2hlcnMubGVuZ3RoIDw9IDEgPyBzdGF0ZS5zZXQoJ3Nob3diYXInLCBmYWxzZSkgOiBmYWxzZVxyXG5cclxuXHRcdC8vIE1ha2UgdGhlIGNsaWNrZWQgY2lyY2xlIGZ1bGwgY29sb3JcclxuXHRcdGQzLnNlbGVjdEFsbCgnY2lyY2xlJykuc3R5bGUoJ29wYWNpdHknLCAnJylcclxuXHRcdGQzLnNlbGVjdChhbGxbaW5kZXhdKS5zdHlsZSgnb3BhY2l0eScsIDEpXHJcblxyXG5cdFx0Ly8gb24gbW9iaWxlLCBwdXQgdGhlIG1hcCBjZW50ZXIgbW9yZSB0byB0aGUgdG9wIG9mIHRoZSBzY3JlZW4gdG8gYWNjb21vZGF0ZSBmb3IgdGhlIGNpdHkgaW5mbyBkaXZcclxuXHRcdGNvbnN0IGNlbnRlciA9XHJcblx0XHRcdHdpbmRvdy5pbm5lcldpZHRoID4gNDAgKiAxNlxyXG5cdFx0XHRcdD8gW2NpdHkuY29vcmRzWzBdLCBjaXR5LmNvb3Jkc1sxXV1cclxuXHRcdFx0XHQ6IFtjaXR5LmNvb3Jkc1swXSwgY2l0eS5jb29yZHNbMV0gLSAwLjNdXHJcblxyXG5cdFx0dGhpcy5tYXBib3guZmx5VG8oe1xyXG5cdFx0XHRjZW50ZXIsXHJcblx0XHRcdHNwZWVkOiAwLjMsXHJcblx0XHRcdGN1cnZlOiAyLFxyXG5cdFx0XHR6b29tOiA4XHJcblx0XHR9KVxyXG5cdH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBjaXR5XHJcbiIsIi8qIGdsb2JhbCBkMyAqL1xyXG5jb25zdCB0b29sdGlwID0ge1xyXG5cdHNob3coZWxlbWVudCwgdGV4dCkge1xyXG5cdFx0ZDMuc2VsZWN0KGAjJHtlbGVtZW50fSAudG9vbHRpcGApXHJcblx0XHRcdC5zdHlsZSgnbGVmdCcsIGAke2QzLmV2ZW50LnBhZ2VYfXB4YCkgLy8gZGVubmlzXHJcblx0XHRcdC5zdHlsZSgndG9wJywgYCR7ZDMuZXZlbnQucGFnZVkgLSAzMH1weGApIC8vIGRlbm5pc1xyXG5cdFx0XHQudHJhbnNpdGlvbigpXHJcblx0XHRcdC5kdXJhdGlvbigzMDApXHJcblx0XHRcdC5zdHlsZSgnb3BhY2l0eScsIDAuOClcclxuXHRcdFx0LnNlbGVjdCgnaDQnKVxyXG5cdFx0XHQudGV4dCh0ZXh0KVxyXG5cdH0sXHJcblx0aGlkZShlbGVtZW50KSB7XHJcblx0XHRkMy5zZWxlY3QoYCMke2VsZW1lbnR9IC50b29sdGlwYClcclxuXHRcdFx0LnRyYW5zaXRpb24oKVxyXG5cdFx0XHQuZHVyYXRpb24oMzAwKVxyXG5cdFx0XHQuc3R5bGUoJ29wYWNpdHknLCAwKVxyXG5cdH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB0b29sdGlwXHJcbiIsIi8qIGdsb2JhbCBkMyAqL1xyXG5jb25zdCBzdGF0ZSA9IHJlcXVpcmUoJy4uL3N0YXRlLmpzJylcclxuY29uc3QgaGVscGVyID0ge1xyXG5cdC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9kMy9kMy1zY2FsZSNjb250aW51b3VzLXNjYWxlc1xyXG5cdC8vIGh0dHA6Ly93d3cuamVyb21lY3VraWVyLm5ldC8yMDExLzA4LzExL2QzLXNjYWxlcy1hbmQtY29sb3IvXHJcblx0Y29sb3IoZGF0YSkge1xyXG5cdFx0cmV0dXJuIGQzXHJcblx0XHRcdC5zY2FsZUxpbmVhcigpXHJcblx0XHRcdC5kb21haW4oWzAsIE1hdGgucm91bmQoZGF0YS5sZW5ndGggLyAyKSwgZGF0YS5sZW5ndGhdKVxyXG5cdFx0XHQucmFuZ2UoWycjQkJFNEEwJywgJyM1MkE4QUYnLCAnIzAwMzA1QyddKVxyXG5cdH0sXHJcblxyXG5cdGdyb3VwQ2l0aWVzKGRhdGEsIGNvb3JkaW5hdGVzKSB7XHJcblx0XHRjb25zdCBjaXRpZXMgPSBkM1xyXG5cdFx0XHQubmVzdCgpXHJcblx0XHRcdC5rZXkoYm9vayA9PiBib29rLnB1YmxpY2F0aW9uLnBsYWNlKVxyXG5cdFx0XHQua2V5KGJvb2sgPT4gYm9vay5wdWJsaWNhdGlvbi5wdWJsaXNoZXIpXHJcblx0XHRcdC5lbnRyaWVzKGRhdGEpXHJcblx0XHRcdC5tYXAoY2l0eSA9PiB7XHJcblx0XHRcdFx0Ly8gbWF0Y2ggZXF1YWxzIHRydWUgaWYgY2l0eSBpcyBpbiBjb29yZGluYXRlcyBkYXRhYmFzZVxyXG5cdFx0XHRcdGNvbnN0IG1hdGNoID0gY29vcmRpbmF0ZXMuZmluZChcclxuXHRcdFx0XHRcdHBsYWNlID0+IHBsYWNlLmNpdHkudG9Mb3dlckNhc2UoKSA9PT0gY2l0eS5rZXkudG9Mb3dlckNhc2UoKVxyXG5cdFx0XHRcdClcclxuXHRcdFx0XHRpZiAoIW1hdGNoKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gbnVsbFxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRjb25zdCB0b3RhbCA9IGNpdHkudmFsdWVzXHJcblx0XHRcdFx0XHQubWFwKHB1Ymxpc2hlciA9PiBwdWJsaXNoZXIudmFsdWVzLmxlbmd0aClcclxuXHRcdFx0XHRcdC5yZWR1Y2UoKGEsIGIpID0+IGEgKyBiLCAwKVxyXG5cclxuXHRcdFx0XHRjb25zdCBjb29yZHMgPSBbTnVtYmVyKG1hdGNoLmxuZyksIE51bWJlcihtYXRjaC5sYXQpXVxyXG5cclxuXHRcdFx0XHRyZXR1cm4ge1xyXG5cdFx0XHRcdFx0Li4uY2l0eSxcclxuXHRcdFx0XHRcdHRvdGFsLFxyXG5cdFx0XHRcdFx0Y29vcmRzXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KVxyXG5cdFx0XHQuZmlsdGVyKGNpdHkgPT4gY2l0eSAhPT0gbnVsbClcclxuXHRcdHJldHVybiBjaXRpZXNcclxuXHR9LFxyXG5cclxuXHRmaWx0ZXJHZW5yZShnZW5yZSkge1xyXG5cdFx0bGV0IGRhdGFcclxuXHJcblx0XHRpZiAoZ2VucmUgPT09ICdhbGwnKSB7XHJcblx0XHRcdGRhdGEgPSBzdGF0ZS5kYXRhLnRvdGFsXHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRkYXRhID0gc3RhdGUuZGF0YS50b3RhbC5maWx0ZXIoYm9vayA9PiBib29rLmdlbnJlcy5pbmNsdWRlcyhnZW5yZSkpXHJcblx0XHR9XHJcblxyXG5cdFx0ZDMuc2VsZWN0QWxsKCdjaXJjbGUnKVxyXG5cdFx0XHQuc3R5bGUoJ2ZpbGwnLCAnJylcclxuXHRcdFx0LnN0eWxlKCdzdHJva2UnLCAnJylcclxuXHJcblx0XHRzdGF0ZS5zZXQoJ2NpdHknLCB7XHJcblx0XHRcdC4uLnN0YXRlLmNpdHksXHJcblx0XHRcdG5hbWU6ICcnXHJcblx0XHR9KVxyXG5cdFx0c3RhdGUuc2V0KGRhdGEsIHtcclxuXHRcdFx0Li4uc3RhdGUuZGF0YSxcclxuXHRcdFx0Y2l0aWVzOiB0aGlzLmdyb3VwQ2l0aWVzKGRhdGEsIHN0YXRlLmRhdGEuY29vcmRpbmF0ZXMpLFxyXG5cdFx0XHRhbW91bnQ6IGRhdGEubGVuZ3RoXHJcblx0XHR9KVxyXG5cdH0sXHJcblxyXG5cdGZvcm1hdERhdGEocmVzdWx0cykge1xyXG5cdFx0Y29uc3QgY29vcmRpbmF0ZXMgPSByZXN1bHRzWzBdLmNvbmNhdChyZXN1bHRzWzFdKVxyXG5cclxuXHRcdGNvbnN0IGhhc1B1YmxpY2F0aW9uID0gcmVzdWx0c1syXVxyXG5cdFx0XHQuZmlsdGVyKGJvb2sgPT4gYm9vay5wdWJsaWNhdGlvbi5wbGFjZSAmJiBib29rLnB1YmxpY2F0aW9uLnB1Ymxpc2hlcilcclxuXHRcdFx0Lm1hcChib29rID0+IHtcclxuXHRcdFx0XHQvLyBNYWtlIHN1cmUgcmFuZG9tIGNoYXJhY3RlcnMgYXJlIHJlbW92ZWQgZnJvbSB0aGUgcHVibGljYXRpb24gY2l0eSBuYW1lXHJcblx0XHRcdFx0Ym9vay5wdWJsaWNhdGlvbi5wbGFjZSA9IGJvb2sucHVibGljYXRpb24ucGxhY2VcclxuXHRcdFx0XHRcdC5yZXBsYWNlKC9bXmEtekEtWixcXHNdKy9nLCAnJylcclxuXHRcdFx0XHRcdC50cmltKClcclxuXHRcdFx0XHRcdC5zcGxpdCgnLCcpWzBdXHJcblx0XHRcdFx0Ly8gTWFrZSBzdXJlIGluY29uc2lzdGVuY2llcyBpbiBuYW1pbmcgb2YgcHVibGlzaGVycyBnZXQgZ3JvdXBlZCB0b2dldGhlclxyXG5cdFx0XHRcdGJvb2sucHVibGljYXRpb24ucHVibGlzaGVyID0gYm9vay5wdWJsaWNhdGlvbi5wdWJsaXNoZXJcclxuXHRcdFx0XHRcdC5yZXBsYWNlKC9bXmEtekEtWixcXHNdKy9nLCAnJylcclxuXHRcdFx0XHRcdC5yZXBsYWNlKCdVaXRnZXZlcmlqJywgJycpXHJcblx0XHRcdFx0XHQucmVwbGFjZSgndWl0Z2V2ZXJpaicsICcnKVxyXG5cdFx0XHRcdFx0LnRyaW0oKVxyXG5cdFx0XHRcdFx0LnNwbGl0KCcsJylbMF1cclxuXHRcdFx0XHRcdC50b0xvd2VyQ2FzZSgpXHJcblx0XHRcdFx0XHQvLyBodHRwczovL2pvc2h0cm9uaWMuY29tLzIwMTYvMDIvMTQvaG93LXRvLWNhcGl0YWxpemUtdGhlLWZpcnN0LWxldHRlci1pbi1hLXN0cmluZy1pbi1qYXZhc2NyaXB0L1xyXG5cdFx0XHRcdFx0LnJlcGxhY2UoL15cXHcvLCBjID0+IGMudG9VcHBlckNhc2UoKSlcclxuXHRcdFx0XHRyZXR1cm4gYm9va1xyXG5cdFx0XHR9KVxyXG5cclxuXHRcdGNvbnN0IGdlbnJlcyA9IGhhc1B1YmxpY2F0aW9uXHJcblx0XHRcdC5tYXAoYm9vayA9PiBib29rLmdlbnJlcylcclxuXHRcdFx0LnJlZHVjZSgodG90YWwsIGJvb2tHZW5yZXMpID0+IHRvdGFsLmNvbmNhdChib29rR2VucmVzKSwgW10pXHJcblx0XHRcdC5zb3J0KClcclxuXHJcblx0XHRjb25zdCBjaXRpZXMgPSB0aGlzLmdyb3VwQ2l0aWVzKGhhc1B1YmxpY2F0aW9uLCBjb29yZGluYXRlcylcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdGNpdGllczogY2l0aWVzLFxyXG5cdFx0XHQvLyBIZXJlIG5ldyBTZXQgZ2VuZXJhdGVzIGFuIGFycmF5IHdpdGggb25seSB1bmlxdWUgdmFsdWVzIGZyb20gYSBkaWZmZXJlbnQgYXJyYXlcclxuXHRcdFx0Z2VucmVzOiBbLi4ubmV3IFNldChnZW5yZXMpXSxcclxuXHRcdFx0YW1vdW50OiBoYXNQdWJsaWNhdGlvbi5sZW5ndGgsXHJcblx0XHRcdHRvdGFsOiBoYXNQdWJsaWNhdGlvbixcclxuXHRcdFx0Y29vcmRpbmF0ZXM6IGNvb3JkaW5hdGVzXHJcblx0XHR9XHJcblx0fVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGhlbHBlclxyXG4iLCJjb25zdCBzdGF0ZSA9IHtcclxuXHRzZXQocHJvcGVydHksIHZhbHVlKSB7XHJcblx0XHR0aGlzW3Byb3BlcnR5XSA9IHZhbHVlXHJcblx0fSxcclxuXHRsb2FkZWQ6IGZhbHNlLFxyXG5cdGN1cnJlbnRDaXR5OiAwLFxyXG5cdHNob3diYXI6IGZhbHNlLFxyXG5cdGZ1bGxzY3JlZW46IGZhbHNlLFxyXG5cdGRhdGE6IHtcclxuXHRcdGdlbnJlczogW10sXHJcblx0XHRhbW91bnQ6IDAsXHJcblx0XHRjaXRpZXM6IFtdLFxyXG5cdFx0dG90YWw6IFtdXHJcblx0fSxcclxuXHRjaXR5OiB7XHJcblx0XHRuYW1lOiAnJyxcclxuXHRcdGFtb3VudDogMCxcclxuXHRcdHB1Ymxpc2hlcnM6IFtdXHJcblx0fVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHN0YXRlXHJcbiIsIi8qIGdsb2JhbCBkMyBWdWUgbWFwYm94Z2wgKi9cclxuY29uc3Qgc3RhdGUgPSByZXF1aXJlKCcuL3N0YXRlLmpzJylcclxuY29uc3QgbWFwID0gcmVxdWlyZSgnLi9kMy9tYXAuanMnKVxyXG5jb25zdCBwaWUgPSByZXF1aXJlKCcuL2QzL3BpZS5qcycpXHJcbmNvbnN0IGhlbHBlciA9IHJlcXVpcmUoJy4vaGVscGVycy9oZWxwZXIuanMnKVxyXG5jb25zdCBsYXlvdXQgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvdnVlLmpzJylcclxuXHJcbmxheW91dCgpXHJcblxyXG5tYXBib3hnbC5hY2Nlc3NUb2tlbiA9XHJcblx0J3BrLmV5SjFJam9pWm1wMlpIQnZiQ0lzSW1FaU9pSmphbTltY1cxaE1tVXdObTgxTTNGdk9XOXZNRE01TW01aUluMC41eFZQWWQ5M1RaUUV5cWNoRE1OQnR3J1xyXG5cclxuY29uc3QgbWFwYm94ID0gbmV3IG1hcGJveGdsLk1hcCh7XHJcblx0Y29udGFpbmVyOiAnbWFwJyxcclxuXHRzdHlsZTogJ21hcGJveDovL3N0eWxlcy9manZkcG9sL2Nqb2p3YmNtNTBka2MycnRmbzNtNHZzNmknLFxyXG5cdGNlbnRlcjogWzQuODk5NDMxLCA1Mi4zNzkxODldLFxyXG5cdHpvb206IDUsXHJcblx0cGl0Y2g6IDQwLFxyXG5cdG1pblpvb206IDJcclxufSlcclxuXHJcbm1hcGJveC5vbignbG9hZCcsICgpID0+IHtcclxuXHRQcm9taXNlLmFsbChbXHJcblx0XHRkMy5jc3YoJ2RhdGEvY29kZXNuZXRoZXJsYW5kcy5jc3YnKSxcclxuXHRcdGQzLmNzdignZGF0YS93b3JsZGNpdGllcy5jc3YnKSxcclxuXHRcdGQzLmpzb24oJ2RhdGEvd291dGVyZGF0YS5qc29uJylcclxuXHRdKVxyXG5cdFx0LnRoZW4ocmVzdWx0cyA9PiB7XHJcblx0XHRcdHN0YXRlLnNldCgnZGF0YScsIGhlbHBlci5mb3JtYXREYXRhKHJlc3VsdHMpKVxyXG5cclxuXHRcdFx0bWFwLmNvbmZpZ3VyZShtYXBib3gpXHJcblx0XHRcdG1hcC5jcmVhdGUoc3RhdGUuZGF0YS5jaXRpZXMpXHJcblxyXG5cdFx0XHRzdGF0ZS5zZXQoJ2xvYWRlZCcsIHRydWUpXHJcblxyXG5cdFx0XHRtYXBib3guZmx5VG8oe1xyXG5cdFx0XHRcdHpvb206IDYsXHJcblx0XHRcdFx0c3BlZWQ6IDAuNFxyXG5cdFx0XHR9KVxyXG5cdFx0fSlcclxuXHRcdC5jYXRjaChlcnIgPT4ge1xyXG5cdFx0XHRjb25zb2xlLmxvZyhlcnIpXHJcblx0XHR9KVxyXG59KVxyXG4iXX0=
