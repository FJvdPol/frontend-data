(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var state = require('../state.js');

var map = require('../d3/map.js');

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

},{"../d3/bar.js":2,"../d3/map.js":3,"../d3/pie.js":4,"../helpers/helper.js":7,"../state.js":8}],2:[function(require,module,exports){
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
    axis.append('g').classed('yAxis', true);
    /*
    == Start source ==
    Appending text to use as axis titles.
    From an example by d3noob:
    https://bl.ocks.org/d3noob/23e42c8f67210ac6c678db2cd07a747e
    Small tweaks to work with my visualisation
    */

    axis.append('text').attr('transform', "rotate(90) translate(".concat(this.height() - this.margin.bottom / 2, ", ").concat(0 - this.width(), ")")).attr('dy', '0.75em').style('text-anchor', 'middle').style('color', 'var(--color-main)').text('Publishers');
    axis.append('text').attr('transform', "rotate(-90) translate(".concat(0 - this.height() / 2 + this.margin.bottom / 2, ", ", 10, ")")).attr('dy', '0.75em').style('text-anchor', 'middle').style('color', 'var(--color-main)').text('Amount of books');
    /* == End source == */

    svg.append('g').classed('parent', true);
    this.update(element, data);
  },
  update: function update(element, data) {
    var _this = this;

    var color = helper.color(data);
    var svg = d3.select("#".concat(element, " svg"));
    var chart = d3.select("#".concat(element, " .parent"));
    var rect = chart.selectAll('rect').data(data);
    /*
    === Start source ===
    Bar chart x scale, y scale, x axis and y axis
    From an example by Mike Bostock
    via https://beta.observablehq.com/@mbostock/d3-bar-chart
    Small edits by me to work with my visualisation
    */

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
    svg.select('.yAxis').call(yAxis);
    /* === End source === */

    rect.enter().append('rect').attr('title', function (d, i) {
      return d.title;
    }).on('mouseover', function (d) {
      return tooltip.show(element, "".concat(d.title, ": ").concat(d.total, " books"));
    }).on('mouseout', function () {
      return tooltip.hide(element);
    }).style('fill', function (d, i) {
      return color(i);
    }).attr('x', function (d) {
      return x(d.title);
    }).attr('y', function (d) {
      return _this.height() - _this.margin.bottom;
    }).attr('height', function () {
      return 0;
    }).attr('width', x.bandwidth()).transition().duration(500).delay(function (d, i, all) {
      return i * (Math.round(100 / all.length) + 1);
    }).attr('y', function (d) {
      return y(d.total);
    }).attr('height', function (d) {
      return y(0) - y(d.total);
    });
    rect.style('fill', function (d, i) {
      return color(i);
    }).attr('x', function (d) {
      return x(d.title);
    }).attr('y', function (d) {
      return _this.height() - _this.margin.bottom;
    }).attr('height', function () {
      return 0;
    }).attr('width', x.bandwidth()).transition().duration(500).delay(function (d, i, all) {
      return i * (Math.round(100 / all.length) + 1);
    }).attr('y', function (d) {
      return y(d.total);
    }).attr('height', function (d) {
      return y(0) - y(d.total);
    });
    rect.exit().remove();
  },
  height: function height() {
    return this.width() / 2 > window.innerHeight - 10 * 16 ? window.innerHeight - 10 * 16 : this.width() / 2;
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

    var mapPointColor = '#BBE4A0';
    /*
    === Start source ===
    Get Mapbox map canvas container
    From an example by jorditost
    via https://github.com/jorditost/mapboxgl-d3-playground
    */

    var chart = d3.select(this.mapbox.getCanvasContainer());
    /* === End source === */

    chart.append('div').classed('tooltip', true).style('opacity', 0).append('h4');
    var svg = chart.append('svg');
    svg.append('g').attr('fill', mapPointColor).attr('stroke', mapPointColor);
    this.update('map', data);
    this.move('map');
    /*
    === Start source ===
    Update on map interaction
    From an example by jorditost
    via https://github.com/jorditost/mapboxgl-d3-playground
    */

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
    /* === End source === */
  },

  /*
  === Start source ===
  Move function to update map coordinates for map points
  From an example by jorditost
  via https://github.com/jorditost/mapboxgl-d3-playground
  */
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

  /* === End source === */
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

  /*
  === Start source ===
  Projection function to project points on the map based on the current scroll or move state
  From an example by jorditost
  via https://github.com/jorditost/mapboxgl-d3-playground
  */
  project: function project(coords) {
    return this.mapbox.project(new mapboxgl.LngLat(+coords[0], +coords[1]));
  },

  /* === End source === */
  radius: function radius(amount) {
    var startZoom = 6;
    var minPointSize = 15;
    var radiusExp = (this.mapbox.getZoom() - startZoom) * 0.75 + 1;
    return amount * radiusExp + minPointSize > minPointSize ? Math.sqrt(amount * radiusExp + minPointSize) : Math.sqrt(minPointSize);
    /*
    Math.sqrt based on example by google which they use in drawing more true-to-life map points -> https://developers.google.com/maps/documentation/javascript/examples/circle-simple
    */
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
    var radius = this.width() / 2;
    /*
    === Start source ===
    arc and pie functions to correctly configure pie charts
    From an example by Chuck Grimmett
    via http://www.cagrimmett.com/til/2016/08/19/d3-pie-chart.html
    */

    var arc = d3.arc().outerRadius(radius).innerRadius(0);
    var pie = d3.pie().sort(null).value(function (d) {
      return d.total;
    });
    /* === End source === */

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
    })
    /* Saves initial arc value, by example from Mike Bostock (https://bl.ocks.org/mbostock/1346410) */
    .each(function (d, i, all) {
      return all[i]._current = d;
    }).transition().duration(500).attrTween('d', enterTween);
    path.transition().style('fill', function (d, i) {
      return color(i);
    }).duration(500).attrTween('d', arcTween);
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
    }
    /*
    === Start source ===
    Interpolate between previous endpoint of datapoint arc and new endpoint
    From an example by Mike Bostock
    via https://bl.ocks.org/mbostock/1346410
    */


    function arcTween(d) {
      var i = d3.interpolate(this._current, d);
      this._current = i(0);
      return function (t) {
        return arc(i(t));
      };
    }
    /* === End source === */

  },

  /* Makes sure the pie charts (which are rendered next to eachother) don't exceed their container limit.
   On mobile makes sure the charts are half of the viewport with a leftover space of 50 each */
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
    state.city.publishers.length <= 1 ? state.set('showbar', false) : false;
    /* Make the clicked circle full color */

    d3.selectAll('circle').style('opacity', '');
    d3.select(all[index]).style('opacity', 1);
    /* On mobile, put the map center more to the top of the screen to accomodate for the city info div */

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
    d3.select("#".concat(element, " .tooltip")).style('left', "".concat(d3.event.pageX, "px"))
    /* d3.event learned from denniswegereef (https://github.com/denniswegereef) */
    .style('top', "".concat(d3.event.pageY - 30, "px"))
    /* d3.event learned from denniswegereef (https://github.com/denniswegereef) */
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
  /*
  === Start source ===
  Make range of colors to use when rendering items in a bar chart or pie chart
  Based on examples by Jerome Cukier and the d3 documentation
  via https://github.com/d3/d3-scale#continuous-scales
  via http://www.jeromecukier.net/2011/08/11/d3-scales-and-color/
  */
  color: function color(data) {
    return d3.scaleLinear().domain([0, Math.round(data.length / 2), data.length]).range(['#BBE4A0', '#52A8AF', '#00305C']);
  },

  /* === End source === */
  groupCities: function groupCities(data, coordinates) {
    var cities = d3.nest().key(function (book) {
      return book.publication.place;
    }).key(function (book) {
      return book.publication.publisher;
    }).entries(data).map(function (city) {
      /* match equals true if city is in coordinates database */
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
    state.set('showbar', false);
    state.set('data', _objectSpread({}, state.data, {
      cities: this.groupCities(data, state.data.coordinates),
      amount: data.length
    }));
  },
  formatData: function formatData(results) {
    var coordinates = results[0].concat(results[1]);
    var hasPublication = results[2].filter(function (book) {
      return book.publication.place && book.publication.publisher;
    }).map(function (book) {
      /* Make sure random characters are removed from the publication city name */
      book.publication.place = book.publication.place.replace(/[^a-zA-Z,\s]+/g, '').trim().split(',')[0];
      /* Make sure inconsistencies in naming of publishers get grouped together */

      book.publication.publisher = book.publication.publisher.replace(/[^a-zA-Z,\s]+/g, '').replace('Uitgeverij', '').replace('uitgeverij', '').trim().split(',')[0].toLowerCase()
      /*
      === Start source ===
      Capitalize first letter in a string
      from an example by Josh Tronic
      via https://joshtronic.com/2016/02/14/how-to-capitalize-the-first-letter-in-a-string-in-javascript/
      */
      .replace(/^\w/, function (c) {
        return c.toUpperCase();
      });
      /* === End source === */

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

      /* Here new Set generates an array with only unique values from a different array */
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
  Promise.all([d3.csv('data/codesnetherlands.csv'), d3.csv('data/worldcities.csv'), d3.json('data/data.json')]).then(function (results) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY29tcG9uZW50cy92dWUuanMiLCJzcmMvZDMvYmFyLmpzIiwic3JjL2QzL21hcC5qcyIsInNyYy9kMy9waWUuanMiLCJzcmMvZDMvc2hvd2NpdHkuanMiLCJzcmMvZDMvdG9vbHRpcC5qcyIsInNyYy9oZWxwZXJzL2hlbHBlci5qcyIsInNyYy9zdGF0ZS5qcyIsImluZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxJQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsYUFBRCxDQUFyQjs7QUFDQSxJQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsY0FBRCxDQUFuQjs7QUFDQSxJQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsY0FBRCxDQUFuQjs7QUFDQSxJQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsY0FBRCxDQUFuQjs7QUFDQSxJQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsc0JBQUQsQ0FBdEI7O0FBRUEsTUFBTSxDQUFDLE9BQVAsR0FBaUIsWUFBTTtBQUN0QixFQUFBLEdBQUcsQ0FBQyxTQUFKLENBQWMsUUFBZCxFQUF3QjtBQUN2QixJQUFBLEtBQUssRUFBRSxDQUFDLE1BQUQsQ0FEZ0I7QUFFdkIsSUFBQSxRQUFRLEVBQUU7QUFGYSxHQUF4QjtBQUtBLEVBQUEsR0FBRyxDQUFDLFNBQUosQ0FBYyxXQUFkLEVBQTJCO0FBQzFCLElBQUEsS0FBSyxFQUFFLENBQUMsTUFBRCxFQUFTLElBQVQsQ0FEbUI7QUFFMUIsSUFBQSxPQUYwQixxQkFFaEI7QUFDVCxNQUFBLEdBQUcsQ0FBQyxJQUFKLENBQVMsS0FBSyxFQUFkLEVBQWtCLEtBQUssSUFBdkI7QUFDQSxLQUp5QjtBQUsxQixJQUFBLEtBQUssRUFBRTtBQUNOLE1BQUEsSUFETSxrQkFDQztBQUNOLFFBQUEsR0FBRyxDQUFDLE1BQUosQ0FBVyxLQUFLLEVBQWhCLEVBQW9CLEtBQUssSUFBekI7QUFDQTtBQUhL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QUUsQ0FBQyxHQUFILENBQU8sc0JBQVAsQ0FGVyxFQUdYLEVBQUUsQ0FBQyxJQUFILENBQVEsZ0JBQVIsQ0FIVyxDQUFaLEVBS0UsSUFMRixDQUtPLFVBQUEsT0FBTyxFQUFJO0FBQ2hCLElBQUEsS0FBSyxDQUFDLEdBQU4sQ0FBVSxNQUFWLEVBQWtCLE1BQU0sQ0FBQyxVQUFQLENBQWtCLE9BQWxCLENBQWxCO0FBRUEsSUFBQSxHQUFHLENBQUMsU0FBSixDQUFjLE1BQWQ7QUFDQSxJQUFBLEdBQUcsQ0FBQyxNQUFKLENBQVcsS0FBSyxDQUFDLElBQU4sQ0FBVyxNQUF0QjtBQUVBLElBQUEsS0FBSyxDQUFDLEdBQU4sQ0FBVSxRQUFWLEVBQW9CLElBQXBCO0FBRUEsSUFBQSxNQUFNLENBQUMsS0FBUCxDQUFhO0FBQ1osTUFBQSxJQUFJLEVBQUUsQ0FETTtBQUVaLE1BQUEsS0FBSyxFQUFFO0FBRkssS0FBYjtBQUlBLEdBakJGLEVBa0JFLEtBbEJGLENBa0JRLFVBQUEsR0FBRyxFQUFJO0FBQ2IsSUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLEdBQVo7QUFDQSxHQXBCRjtBQXFCQSxDQXRCRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNvbnN0IHN0YXRlID0gcmVxdWlyZSgnLi4vc3RhdGUuanMnKVxyXG5jb25zdCBtYXAgPSByZXF1aXJlKCcuLi9kMy9tYXAuanMnKVxyXG5jb25zdCBwaWUgPSByZXF1aXJlKCcuLi9kMy9waWUuanMnKVxyXG5jb25zdCBiYXIgPSByZXF1aXJlKCcuLi9kMy9iYXIuanMnKVxyXG5jb25zdCBoZWxwZXIgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2hlbHBlci5qcycpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9ICgpID0+IHtcclxuXHRWdWUuY29tcG9uZW50KCdsb2FkZXInLCB7XHJcblx0XHRwcm9wczogWyd0ZXh0J10sXHJcblx0XHR0ZW1wbGF0ZTogJzxoMj57eyB0ZXh0IH19PC9oMj4nXHJcblx0fSlcclxuXHJcblx0VnVlLmNvbXBvbmVudCgncGllLWNoYXJ0Jywge1xyXG5cdFx0cHJvcHM6IFsnZGF0YScsICdpZCddLFxyXG5cdFx0bW91bnRlZCgpIHtcclxuXHRcdFx0cGllLmRyYXcodGhpcy5pZCwgdGhpcy5kYXRhKVxyXG5cdFx0fSxcclxuXHRcdHdhdGNoOiB7XHJcblx0XHRcdGRhdGEoKSB7XHJcblx0XHRcdFx0cGllLnVwZGF0ZSh0aGlzLmlkLCB0aGlzLmRhdGEpXHJcblx0XHRcdH1cclxuXHRcdH0sXHJcblx0XHR0ZW1wbGF0ZTogJzxkaXYgOmlkPVwidGhpcy5pZFwiPjwvZGl2PidcclxuXHR9KVxyXG5cclxuXHRWdWUuY29tcG9uZW50KCdiYXItY2hhcnQnLCB7XHJcblx0XHRwcm9wczogWydzY3JlZW4nLCAnZGF0YScsICdpZCddLFxyXG5cdFx0bW91bnRlZCgpIHtcclxuXHRcdFx0YmFyLmRyYXcodGhpcy5pZCwgdGhpcy5kYXRhKVxyXG5cdFx0fSxcclxuXHRcdHdhdGNoOiB7XHJcblx0XHRcdGRhdGEoKSB7XHJcblx0XHRcdFx0YmFyLnVwZGF0ZSh0aGlzLmlkLCB0aGlzLmRhdGEpXHJcblx0XHRcdH0sXHJcblx0XHRcdHNjcmVlbigpIHtcclxuXHRcdFx0XHRkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjJHt0aGlzLmlkfWApLmlubmVySFRNTCA9ICcnXHJcblx0XHRcdFx0YmFyLmRyYXcodGhpcy5pZCwgdGhpcy5kYXRhKVxyXG5cdFx0XHR9XHJcblx0XHR9LFxyXG5cdFx0dGVtcGxhdGU6ICc8ZGl2IDppZD1cInRoaXMuaWRcIj48L2Rpdj4nXHJcblx0fSlcclxuXHJcblx0Y29uc3QgYXBwID0gbmV3IFZ1ZSh7XHJcblx0XHRlbDogJyNhcHAnLFxyXG5cdFx0ZGF0YSgpIHtcclxuXHRcdFx0cmV0dXJuIHN0YXRlXHJcblx0XHR9LFxyXG5cdFx0bWV0aG9kczoge1xyXG5cdFx0XHRjaGFuZ2VGaWx0ZXI6IGUgPT4ge1xyXG5cdFx0XHRcdGhlbHBlci5maWx0ZXJHZW5yZShlLnRhcmdldC52YWx1ZSlcclxuXHRcdFx0XHRtYXAudXBkYXRlKCdtYXAnLCBzdGF0ZS5kYXRhLmNpdGllcylcclxuXHRcdFx0fSxcclxuXHRcdFx0bWV0YWRhdGFDbGFzczogKCkgPT4ge1xyXG5cdFx0XHRcdGlmIChzdGF0ZS5jaXR5Lm5hbWUgJiYgc3RhdGUuc2hvd2Jhcikge1xyXG5cdFx0XHRcdFx0cmV0dXJuICdtZXRhZGF0YS1ob2xkZXIgY2l0eSdcclxuXHRcdFx0XHR9IGVsc2UgaWYgKHN0YXRlLmNpdHkubmFtZSkge1xyXG5cdFx0XHRcdFx0cmV0dXJuICdtZXRhZGF0YS1ob2xkZXIgY2l0eSBmdWxsJ1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRyZXR1cm4gJ21ldGFkYXRhLWhvbGRlcidcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH0pXHJcbn1cclxuIiwiY29uc3QgdG9vbHRpcCA9IHJlcXVpcmUoJy4vdG9vbHRpcC5qcycpXHJcbmNvbnN0IGhlbHBlciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvaGVscGVyLmpzJylcclxuY29uc3Qgc3RhdGUgPSByZXF1aXJlKCcuLi9zdGF0ZS5qcycpXHJcblxyXG5jb25zdCBiYXIgPSB7XHJcblx0bWFyZ2luOiB7IHRvcDogMjAsIHJpZ2h0OiAzMCwgYm90dG9tOiAxMDAsIGxlZnQ6IDgwIH0sXHJcblxyXG5cdGRyYXcoZWxlbWVudCwgZGF0YSkge1xyXG5cdFx0Y29uc3QgY2hhcnQgPSBkMy5zZWxlY3QoYCMke2VsZW1lbnR9YClcclxuXHJcblx0XHRjaGFydFxyXG5cdFx0XHQuYXBwZW5kKCdkaXYnKVxyXG5cdFx0XHQuY2xhc3NlZCgndG9vbHRpcCcsIHRydWUpXHJcblx0XHRcdC5zdHlsZSgnb3BhY2l0eScsIDApXHJcblx0XHRcdC5hcHBlbmQoJ2g0JylcclxuXHJcblx0XHRjb25zdCBzdmcgPSBjaGFydFxyXG5cdFx0XHQuYXBwZW5kKCdzdmcnKVxyXG5cdFx0XHQuYXR0cignd2lkdGgnLCB0aGlzLndpZHRoKCkpXHJcblx0XHRcdC5hdHRyKCdoZWlnaHQnLCB0aGlzLmhlaWdodCgpKVxyXG5cclxuXHRcdGNvbnN0IGF4aXMgPSBzdmcuYXBwZW5kKCdnJykuY2xhc3NlZCgnYXhpcycsIHRydWUpXHJcblxyXG5cdFx0YXhpcy5hcHBlbmQoJ2cnKS5jbGFzc2VkKCd4QXhpcycsIHRydWUpXHJcblxyXG5cdFx0YXhpcy5hcHBlbmQoJ2cnKS5jbGFzc2VkKCd5QXhpcycsIHRydWUpXHJcblxyXG5cdFx0LypcclxuXHRcdD09IFN0YXJ0IHNvdXJjZSA9PVxyXG5cdFx0QXBwZW5kaW5nIHRleHQgdG8gdXNlIGFzIGF4aXMgdGl0bGVzLlxyXG5cdFx0RnJvbSBhbiBleGFtcGxlIGJ5IGQzbm9vYjpcclxuXHRcdGh0dHBzOi8vYmwub2Nrcy5vcmcvZDNub29iLzIzZTQyYzhmNjcyMTBhYzZjNjc4ZGIyY2QwN2E3NDdlXHJcblx0XHRTbWFsbCB0d2Vha3MgdG8gd29yayB3aXRoIG15IHZpc3VhbGlzYXRpb25cclxuXHRcdCovXHJcblx0XHRheGlzXHJcblx0XHRcdC5hcHBlbmQoJ3RleHQnKVxyXG5cdFx0XHQuYXR0cihcclxuXHRcdFx0XHQndHJhbnNmb3JtJyxcclxuXHRcdFx0XHRgcm90YXRlKDkwKSB0cmFuc2xhdGUoJHt0aGlzLmhlaWdodCgpIC0gdGhpcy5tYXJnaW4uYm90dG9tIC8gMn0sICR7MCAtXHJcblx0XHRcdFx0XHR0aGlzLndpZHRoKCl9KWBcclxuXHRcdFx0KVxyXG5cdFx0XHQuYXR0cignZHknLCAnMC43NWVtJylcclxuXHRcdFx0LnN0eWxlKCd0ZXh0LWFuY2hvcicsICdtaWRkbGUnKVxyXG5cdFx0XHQuc3R5bGUoJ2NvbG9yJywgJ3ZhcigtLWNvbG9yLW1haW4pJylcclxuXHRcdFx0LnRleHQoJ1B1Ymxpc2hlcnMnKVxyXG5cclxuXHRcdGF4aXNcclxuXHRcdFx0LmFwcGVuZCgndGV4dCcpXHJcblx0XHRcdC5hdHRyKFxyXG5cdFx0XHRcdCd0cmFuc2Zvcm0nLFxyXG5cdFx0XHRcdGByb3RhdGUoLTkwKSB0cmFuc2xhdGUoJHswIC1cclxuXHRcdFx0XHRcdHRoaXMuaGVpZ2h0KCkgLyAyICtcclxuXHRcdFx0XHRcdHRoaXMubWFyZ2luLmJvdHRvbSAvIDJ9LCAkezEwfSlgXHJcblx0XHRcdClcclxuXHRcdFx0LmF0dHIoJ2R5JywgJzAuNzVlbScpXHJcblx0XHRcdC5zdHlsZSgndGV4dC1hbmNob3InLCAnbWlkZGxlJylcclxuXHRcdFx0LnN0eWxlKCdjb2xvcicsICd2YXIoLS1jb2xvci1tYWluKScpXHJcblx0XHRcdC50ZXh0KCdBbW91bnQgb2YgYm9va3MnKVxyXG5cdFx0LyogPT0gRW5kIHNvdXJjZSA9PSAqL1xyXG5cclxuXHRcdHN2Zy5hcHBlbmQoJ2cnKS5jbGFzc2VkKCdwYXJlbnQnLCB0cnVlKVxyXG5cclxuXHRcdHRoaXMudXBkYXRlKGVsZW1lbnQsIGRhdGEpXHJcblx0fSxcclxuXHJcblx0dXBkYXRlKGVsZW1lbnQsIGRhdGEpIHtcclxuXHRcdGNvbnN0IGNvbG9yID0gaGVscGVyLmNvbG9yKGRhdGEpXHJcblxyXG5cdFx0Y29uc3Qgc3ZnID0gZDMuc2VsZWN0KGAjJHtlbGVtZW50fSBzdmdgKVxyXG5cclxuXHRcdGNvbnN0IGNoYXJ0ID0gZDMuc2VsZWN0KGAjJHtlbGVtZW50fSAucGFyZW50YClcclxuXHJcblx0XHRjb25zdCByZWN0ID0gY2hhcnQuc2VsZWN0QWxsKCdyZWN0JykuZGF0YShkYXRhKVxyXG5cclxuXHRcdC8qXHJcblx0XHQ9PT0gU3RhcnQgc291cmNlID09PVxyXG5cdFx0QmFyIGNoYXJ0IHggc2NhbGUsIHkgc2NhbGUsIHggYXhpcyBhbmQgeSBheGlzXHJcblx0XHRGcm9tIGFuIGV4YW1wbGUgYnkgTWlrZSBCb3N0b2NrXHJcblx0XHR2aWEgaHR0cHM6Ly9iZXRhLm9ic2VydmFibGVocS5jb20vQG1ib3N0b2NrL2QzLWJhci1jaGFydFxyXG5cdFx0U21hbGwgZWRpdHMgYnkgbWUgdG8gd29yayB3aXRoIG15IHZpc3VhbGlzYXRpb25cclxuXHRcdCovXHJcblx0XHRjb25zdCB4ID0gZDNcclxuXHRcdFx0LnNjYWxlQmFuZCgpXHJcblx0XHRcdC5kb21haW4oZGF0YS5tYXAoZCA9PiBkLnRpdGxlKSlcclxuXHRcdFx0LnJhbmdlKFt0aGlzLm1hcmdpbi5sZWZ0LCB0aGlzLndpZHRoKCkgLSB0aGlzLm1hcmdpbi5yaWdodF0pXHJcblx0XHRcdC5wYWRkaW5nKDAuMSlcclxuXHJcblx0XHRjb25zdCB5ID0gZDNcclxuXHRcdFx0LnNjYWxlTGluZWFyKClcclxuXHRcdFx0LmRvbWFpbihbMCwgZDMubWF4KGRhdGEsIGQgPT4gZC50b3RhbCldKVxyXG5cdFx0XHQubmljZSgpXHJcblx0XHRcdC5yYW5nZShbdGhpcy5oZWlnaHQoKSAtIHRoaXMubWFyZ2luLmJvdHRvbSwgdGhpcy5tYXJnaW4udG9wXSlcclxuXHJcblx0XHRjb25zdCB4QXhpcyA9IGcgPT5cclxuXHRcdFx0Z1xyXG5cdFx0XHRcdC5hdHRyKCd0cmFuc2Zvcm0nLCBgdHJhbnNsYXRlKDAsJHt0aGlzLmhlaWdodCgpIC0gdGhpcy5tYXJnaW4uYm90dG9tfSlgKVxyXG5cdFx0XHRcdC5jYWxsKGQzLmF4aXNCb3R0b20oeCkudGlja1NpemVPdXRlcigwKSlcclxuXHRcdFx0XHQuc2VsZWN0QWxsKCd0ZXh0JylcclxuXHRcdFx0XHQuYXR0cigneScsIDApXHJcblx0XHRcdFx0LmF0dHIoJ3gnLCAxMClcclxuXHRcdFx0XHQuYXR0cignZHknLCAnLjM1ZW0nKVxyXG5cdFx0XHRcdC5hdHRyKCd0cmFuc2Zvcm0nLCAncm90YXRlKDkwKScpXHJcblx0XHRcdFx0LnN0eWxlKCd0ZXh0LWFuY2hvcicsICdzdGFydCcpXHJcblxyXG5cdFx0Y29uc3QgeUF4aXMgPSBnID0+XHJcblx0XHRcdGdcclxuXHRcdFx0XHQuYXR0cigndHJhbnNmb3JtJywgYHRyYW5zbGF0ZSgke3RoaXMubWFyZ2luLmxlZnR9LDApYClcclxuXHRcdFx0XHQuY2FsbChkMy5heGlzTGVmdCh5KSlcclxuXHRcdFx0XHQuY2FsbChnID0+IGcuc2VsZWN0KCcuZG9tYWluJykucmVtb3ZlKCkpXHJcblxyXG5cdFx0c3ZnLnNlbGVjdCgnLnhBeGlzJykuY2FsbCh4QXhpcylcclxuXHJcblx0XHRzdmcuc2VsZWN0KCcueUF4aXMnKS5jYWxsKHlBeGlzKVxyXG5cdFx0LyogPT09IEVuZCBzb3VyY2UgPT09ICovXHJcblxyXG5cdFx0cmVjdFxyXG5cdFx0XHQuZW50ZXIoKVxyXG5cdFx0XHQuYXBwZW5kKCdyZWN0JylcclxuXHRcdFx0LmF0dHIoJ3RpdGxlJywgKGQsIGkpID0+IGQudGl0bGUpXHJcblx0XHRcdC5vbignbW91c2VvdmVyJywgZCA9PlxyXG5cdFx0XHRcdHRvb2x0aXAuc2hvdyhlbGVtZW50LCBgJHtkLnRpdGxlfTogJHtkLnRvdGFsfSBib29rc2ApXHJcblx0XHRcdClcclxuXHRcdFx0Lm9uKCdtb3VzZW91dCcsICgpID0+IHRvb2x0aXAuaGlkZShlbGVtZW50KSlcclxuXHRcdFx0LnN0eWxlKCdmaWxsJywgKGQsIGkpID0+IGNvbG9yKGkpKVxyXG5cdFx0XHQuYXR0cigneCcsIGQgPT4geChkLnRpdGxlKSlcclxuXHRcdFx0LmF0dHIoJ3knLCBkID0+IHRoaXMuaGVpZ2h0KCkgLSB0aGlzLm1hcmdpbi5ib3R0b20pXHJcblx0XHRcdC5hdHRyKCdoZWlnaHQnLCAoKSA9PiAwKVxyXG5cdFx0XHQuYXR0cignd2lkdGgnLCB4LmJhbmR3aWR0aCgpKVxyXG5cdFx0XHQudHJhbnNpdGlvbigpXHJcblx0XHRcdC5kdXJhdGlvbig1MDApXHJcblx0XHRcdC5kZWxheSgoZCwgaSwgYWxsKSA9PiBpICogKE1hdGgucm91bmQoMTAwIC8gYWxsLmxlbmd0aCkgKyAxKSlcclxuXHRcdFx0LmF0dHIoJ3knLCBkID0+IHkoZC50b3RhbCkpXHJcblx0XHRcdC5hdHRyKCdoZWlnaHQnLCBkID0+IHkoMCkgLSB5KGQudG90YWwpKVxyXG5cclxuXHRcdHJlY3RcclxuXHRcdFx0LnN0eWxlKCdmaWxsJywgKGQsIGkpID0+IGNvbG9yKGkpKVxyXG5cdFx0XHQuYXR0cigneCcsIGQgPT4geChkLnRpdGxlKSlcclxuXHRcdFx0LmF0dHIoJ3knLCBkID0+IHRoaXMuaGVpZ2h0KCkgLSB0aGlzLm1hcmdpbi5ib3R0b20pXHJcblx0XHRcdC5hdHRyKCdoZWlnaHQnLCAoKSA9PiAwKVxyXG5cdFx0XHQuYXR0cignd2lkdGgnLCB4LmJhbmR3aWR0aCgpKVxyXG5cdFx0XHQudHJhbnNpdGlvbigpXHJcblx0XHRcdC5kdXJhdGlvbig1MDApXHJcblx0XHRcdC5kZWxheSgoZCwgaSwgYWxsKSA9PiBpICogKE1hdGgucm91bmQoMTAwIC8gYWxsLmxlbmd0aCkgKyAxKSlcclxuXHRcdFx0LmF0dHIoJ3knLCBkID0+IHkoZC50b3RhbCkpXHJcblx0XHRcdC5hdHRyKCdoZWlnaHQnLCBkID0+IHkoMCkgLSB5KGQudG90YWwpKVxyXG5cclxuXHRcdHJlY3QuZXhpdCgpLnJlbW92ZSgpXHJcblx0fSxcclxuXHJcblx0aGVpZ2h0KCkge1xyXG5cdFx0cmV0dXJuIHRoaXMud2lkdGgoKSAvIDIgPiB3aW5kb3cuaW5uZXJIZWlnaHQgLSAxMCAqIDE2XHJcblx0XHRcdD8gd2luZG93LmlubmVySGVpZ2h0IC0gMTAgKiAxNlxyXG5cdFx0XHQ6IHRoaXMud2lkdGgoKSAvIDJcclxuXHR9LFxyXG5cclxuXHR3aWR0aCgpIHtcclxuXHRcdHJldHVybiBzdGF0ZS5mdWxsc2NyZWVuXHJcblx0XHRcdD8gd2luZG93LmlubmVyV2lkdGggLSA2ICogMTZcclxuXHRcdFx0OiB3aW5kb3cuaW5uZXJXaWR0aCAvIDEuNzUgLy8gKDIwIC0gMykgKiAxNlxyXG5cdH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBiYXJcclxuIiwiLyogZ2xvYmFsIGQzIG1hcGJveGdsICovXHJcbmNvbnN0IGNpdHkgPSByZXF1aXJlKCcuL3Nob3djaXR5LmpzJylcclxuY29uc3QgdG9vbHRpcCA9IHJlcXVpcmUoJy4vdG9vbHRpcC5qcycpXHJcblxyXG5jb25zdCBtYXAgPSB7XHJcblx0Y29uZmlndXJlKG1hcGJveCkge1xyXG5cdFx0dGhpcy5tYXBib3ggPSBtYXBib3hcclxuXHRcdGNpdHkuY29uZmlndXJlKG1hcGJveClcclxuXHR9LFxyXG5cdGNyZWF0ZShkYXRhLCBtYXBib3gpIHtcclxuXHRcdGNvbnN0IG1hcFBvaW50Q29sb3IgPSAnI0JCRTRBMCdcclxuXHJcblx0XHQvKlxyXG5cdFx0PT09IFN0YXJ0IHNvdXJjZSA9PT1cclxuXHRcdEdldCBNYXBib3ggbWFwIGNhbnZhcyBjb250YWluZXJcclxuXHRcdEZyb20gYW4gZXhhbXBsZSBieSBqb3JkaXRvc3RcclxuXHRcdHZpYSBodHRwczovL2dpdGh1Yi5jb20vam9yZGl0b3N0L21hcGJveGdsLWQzLXBsYXlncm91bmRcclxuXHRcdCovXHJcblx0XHRjb25zdCBjaGFydCA9IGQzLnNlbGVjdCh0aGlzLm1hcGJveC5nZXRDYW52YXNDb250YWluZXIoKSlcclxuXHRcdC8qID09PSBFbmQgc291cmNlID09PSAqL1xyXG5cclxuXHRcdGNoYXJ0XHJcblx0XHRcdC5hcHBlbmQoJ2RpdicpXHJcblx0XHRcdC5jbGFzc2VkKCd0b29sdGlwJywgdHJ1ZSlcclxuXHRcdFx0LnN0eWxlKCdvcGFjaXR5JywgMClcclxuXHRcdFx0LmFwcGVuZCgnaDQnKVxyXG5cclxuXHRcdGNvbnN0IHN2ZyA9IGNoYXJ0LmFwcGVuZCgnc3ZnJylcclxuXHJcblx0XHRzdmdcclxuXHRcdFx0LmFwcGVuZCgnZycpXHJcblx0XHRcdC5hdHRyKCdmaWxsJywgbWFwUG9pbnRDb2xvcilcclxuXHRcdFx0LmF0dHIoJ3N0cm9rZScsIG1hcFBvaW50Q29sb3IpXHJcblxyXG5cdFx0dGhpcy51cGRhdGUoJ21hcCcsIGRhdGEpXHJcblxyXG5cdFx0dGhpcy5tb3ZlKCdtYXAnKVxyXG5cclxuXHRcdC8qXHJcblx0XHQ9PT0gU3RhcnQgc291cmNlID09PVxyXG5cdFx0VXBkYXRlIG9uIG1hcCBpbnRlcmFjdGlvblxyXG5cdFx0RnJvbSBhbiBleGFtcGxlIGJ5IGpvcmRpdG9zdFxyXG5cdFx0dmlhIGh0dHBzOi8vZ2l0aHViLmNvbS9qb3JkaXRvc3QvbWFwYm94Z2wtZDMtcGxheWdyb3VuZFxyXG5cdFx0Ki9cclxuXHRcdHRoaXMubWFwYm94Lm9uKCd2aWV3cmVzZXQnLCAoKSA9PiB0aGlzLm1vdmUoJ21hcCcpKVxyXG5cdFx0dGhpcy5tYXBib3gub24oJ21vdmUnLCAoKSA9PiB0aGlzLm1vdmUoJ21hcCcpKVxyXG5cdFx0dGhpcy5tYXBib3gub24oJ21vdmVlbmQnLCAoKSA9PiB0aGlzLm1vdmUoJ21hcCcpKVxyXG5cdFx0dGhpcy5tYXBib3gub24oJ3pvb20nLCAoKSA9PiB0aGlzLm1vdmUoJ21hcCcpKVxyXG5cdFx0LyogPT09IEVuZCBzb3VyY2UgPT09ICovXHJcblx0fSxcclxuXHJcblx0LypcclxuXHQ9PT0gU3RhcnQgc291cmNlID09PVxyXG5cdE1vdmUgZnVuY3Rpb24gdG8gdXBkYXRlIG1hcCBjb29yZGluYXRlcyBmb3IgbWFwIHBvaW50c1xyXG5cdEZyb20gYW4gZXhhbXBsZSBieSBqb3JkaXRvc3RcclxuXHR2aWEgaHR0cHM6Ly9naXRodWIuY29tL2pvcmRpdG9zdC9tYXBib3hnbC1kMy1wbGF5Z3JvdW5kXHJcblx0Ki9cclxuXHRtb3ZlKGVsZW1lbnQpIHtcclxuXHRcdGQzLnNlbGVjdChgIyR7ZWxlbWVudH0gZ2ApXHJcblx0XHRcdC5zZWxlY3RBbGwoJ2NpcmNsZScpXHJcblx0XHRcdC50cmFuc2l0aW9uKClcclxuXHRcdFx0LmR1cmF0aW9uKDApXHJcblx0XHRcdC5hdHRyKCdjeCcsIGQgPT4gdGhpcy5wcm9qZWN0KGQuY29vcmRzKS54KVxyXG5cdFx0XHQuYXR0cignY3knLCBkID0+IHRoaXMucHJvamVjdChkLmNvb3JkcykueSlcclxuXHRcdFx0LmF0dHIoJ3InLCBkID0+IHRoaXMucmFkaXVzKGQudG90YWwpKVxyXG5cdH0sXHJcblx0LyogPT09IEVuZCBzb3VyY2UgPT09ICovXHJcblxyXG5cdHVwZGF0ZShlbGVtZW50LCBkYXRhKSB7XHJcblx0XHRjb25zdCB0cmFuc2l0aW9uID0gMzAwXHJcblxyXG5cdFx0Y29uc3QgY2hhcnQgPSBkMy5zZWxlY3QoYCMke2VsZW1lbnR9IHN2ZyBnYClcclxuXHJcblx0XHRjb25zdCBjaXJjbGVzID0gY2hhcnQuc2VsZWN0QWxsKCdjaXJjbGUnKS5kYXRhKGRhdGEpXHJcblxyXG5cdFx0Y2lyY2xlc1xyXG5cdFx0XHQudHJhbnNpdGlvbigpXHJcblx0XHRcdC5kdXJhdGlvbih0cmFuc2l0aW9uKVxyXG5cdFx0XHQuYXR0cigncicsIDApXHJcblx0XHRcdC50cmFuc2l0aW9uKClcclxuXHRcdFx0LmR1cmF0aW9uKDApXHJcblx0XHRcdC5hdHRyKCdjeCcsIGQgPT4gdGhpcy5wcm9qZWN0KGQuY29vcmRzKS54KVxyXG5cdFx0XHQuYXR0cignY3knLCBkID0+IHRoaXMucHJvamVjdChkLmNvb3JkcykueSlcclxuXHRcdFx0LnRyYW5zaXRpb24oKVxyXG5cdFx0XHQuZHVyYXRpb24odHJhbnNpdGlvbilcclxuXHRcdFx0LmF0dHIoJ3InLCBkID0+IHRoaXMucmFkaXVzKGQudG90YWwpKVxyXG5cclxuXHRcdGNpcmNsZXNcclxuXHRcdFx0LmVudGVyKClcclxuXHRcdFx0LmFwcGVuZCgnY2lyY2xlJylcclxuXHRcdFx0LmF0dHIoJ3InLCAwKVxyXG5cdFx0XHQuYXR0cignY3gnLCBkID0+IHRoaXMucHJvamVjdChkLmNvb3JkcykueClcclxuXHRcdFx0LmF0dHIoJ2N5JywgZCA9PiB0aGlzLnByb2plY3QoZC5jb29yZHMpLnkpXHJcblx0XHRcdC5vbignbW91c2VvdmVyJywgZCA9PiB0b29sdGlwLnNob3coZWxlbWVudCwgYCR7ZC5rZXl9OiAke2QudG90YWx9IGJvb2tzYCkpXHJcblx0XHRcdC5vbignbW91c2VvdXQnLCAoKSA9PiB0b29sdGlwLmhpZGUoZWxlbWVudCkpXHJcblx0XHRcdC5vbignY2xpY2snLCAoZCwgaSwgYWxsKSA9PiB7XHJcblx0XHRcdFx0dG9vbHRpcC5oaWRlKGVsZW1lbnQpXHJcblx0XHRcdFx0Y2l0eS5zaG93KGQsIGksIGFsbClcclxuXHRcdFx0fSlcclxuXHRcdFx0LnRyYW5zaXRpb24oKVxyXG5cdFx0XHQuZGVsYXkodHJhbnNpdGlvbilcclxuXHRcdFx0LmR1cmF0aW9uKHRyYW5zaXRpb24pXHJcblx0XHRcdC5hdHRyKCdyJywgZCA9PiB0aGlzLnJhZGl1cyhkLnRvdGFsKSlcclxuXHJcblx0XHRjaXJjbGVzXHJcblx0XHRcdC5leGl0KClcclxuXHRcdFx0LnRyYW5zaXRpb24oKVxyXG5cdFx0XHQuZHVyYXRpb24odHJhbnNpdGlvbilcclxuXHRcdFx0LmF0dHIoJ3InLCAwKVxyXG5cdFx0XHQucmVtb3ZlKClcclxuXHR9LFxyXG5cclxuXHQvKlxyXG5cdD09PSBTdGFydCBzb3VyY2UgPT09XHJcblx0UHJvamVjdGlvbiBmdW5jdGlvbiB0byBwcm9qZWN0IHBvaW50cyBvbiB0aGUgbWFwIGJhc2VkIG9uIHRoZSBjdXJyZW50IHNjcm9sbCBvciBtb3ZlIHN0YXRlXHJcblx0RnJvbSBhbiBleGFtcGxlIGJ5IGpvcmRpdG9zdFxyXG5cdHZpYSBodHRwczovL2dpdGh1Yi5jb20vam9yZGl0b3N0L21hcGJveGdsLWQzLXBsYXlncm91bmRcclxuXHQqL1xyXG5cdHByb2plY3QoY29vcmRzKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5tYXBib3gucHJvamVjdChuZXcgbWFwYm94Z2wuTG5nTGF0KCtjb29yZHNbMF0sICtjb29yZHNbMV0pKVxyXG5cdH0sXHJcblx0LyogPT09IEVuZCBzb3VyY2UgPT09ICovXHJcblxyXG5cdHJhZGl1cyhhbW91bnQpIHtcclxuXHRcdGNvbnN0IHN0YXJ0Wm9vbSA9IDZcclxuXHRcdGNvbnN0IG1pblBvaW50U2l6ZSA9IDE1XHJcblx0XHRjb25zdCByYWRpdXNFeHAgPSAodGhpcy5tYXBib3guZ2V0Wm9vbSgpIC0gc3RhcnRab29tKSAqIDAuNzUgKyAxXHJcblx0XHRyZXR1cm4gYW1vdW50ICogcmFkaXVzRXhwICsgbWluUG9pbnRTaXplID4gbWluUG9pbnRTaXplXHJcblx0XHRcdD8gTWF0aC5zcXJ0KGFtb3VudCAqIHJhZGl1c0V4cCArIG1pblBvaW50U2l6ZSlcclxuXHRcdFx0OiBNYXRoLnNxcnQobWluUG9pbnRTaXplKVxyXG5cdFx0LypcclxuXHRcdE1hdGguc3FydCBiYXNlZCBvbiBleGFtcGxlIGJ5IGdvb2dsZSB3aGljaCB0aGV5IHVzZSBpbiBkcmF3aW5nIG1vcmUgdHJ1ZS10by1saWZlIG1hcCBwb2ludHMgLT4gaHR0cHM6Ly9kZXZlbG9wZXJzLmdvb2dsZS5jb20vbWFwcy9kb2N1bWVudGF0aW9uL2phdmFzY3JpcHQvZXhhbXBsZXMvY2lyY2xlLXNpbXBsZVxyXG5cdFx0Ki9cclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gbWFwXHJcbiIsIi8qIGdsb2JhbCBkMyAqL1xyXG5jb25zdCB0b29sdGlwID0gcmVxdWlyZSgnLi90b29sdGlwLmpzJylcclxuY29uc3QgaGVscGVyID0gcmVxdWlyZSgnLi4vaGVscGVycy9oZWxwZXIuanMnKVxyXG5cclxuY29uc3QgcGllID0ge1xyXG5cdGRyYXcoZWxlbWVudCwgZGF0YSkge1xyXG5cdFx0Y29uc3QgaGVpZ2h0ID0gdGhpcy53aWR0aCgpXHJcblx0XHRjb25zdCB3aWR0aCA9IHRoaXMud2lkdGgoKVxyXG5cclxuXHRcdGNvbnN0IGNoYXJ0ID0gZDMuc2VsZWN0KGAjJHtlbGVtZW50fWApXHJcblxyXG5cdFx0Y2hhcnRcclxuXHRcdFx0LmFwcGVuZCgnZGl2JylcclxuXHRcdFx0LmNsYXNzZWQoJ3Rvb2x0aXAnLCB0cnVlKVxyXG5cdFx0XHQuc3R5bGUoJ29wYWNpdHknLCAwKVxyXG5cdFx0XHQuYXBwZW5kKCdoNCcpXHJcblxyXG5cdFx0Y2hhcnRcclxuXHRcdFx0LmFwcGVuZCgnc3ZnJylcclxuXHRcdFx0LmF0dHIoJ3dpZHRoJywgd2lkdGgpXHJcblx0XHRcdC5hdHRyKCdoZWlnaHQnLCBoZWlnaHQpXHJcblx0XHRcdC5hcHBlbmQoJ2cnKVxyXG5cdFx0XHQuY2xhc3NlZCgncGFyZW50JywgdHJ1ZSlcclxuXHRcdFx0LmF0dHIoJ3RyYW5zZm9ybScsIGB0cmFuc2xhdGUoJHt3aWR0aCAvIDJ9LCAke2hlaWdodCAvIDJ9KWApXHJcblxyXG5cdFx0dGhpcy51cGRhdGUoZWxlbWVudCwgZGF0YSlcclxuXHR9LFxyXG5cclxuXHR1cGRhdGUoZWxlbWVudCwgZGF0YSkge1xyXG5cdFx0Y29uc3QgY29sb3IgPSBoZWxwZXIuY29sb3IoZGF0YSlcclxuXHJcblx0XHRjb25zdCByYWRpdXMgPSB0aGlzLndpZHRoKCkgLyAyXHJcblxyXG5cdFx0LypcclxuXHRcdD09PSBTdGFydCBzb3VyY2UgPT09XHJcblx0XHRhcmMgYW5kIHBpZSBmdW5jdGlvbnMgdG8gY29ycmVjdGx5IGNvbmZpZ3VyZSBwaWUgY2hhcnRzXHJcblx0XHRGcm9tIGFuIGV4YW1wbGUgYnkgQ2h1Y2sgR3JpbW1ldHRcclxuXHRcdHZpYSBodHRwOi8vd3d3LmNhZ3JpbW1ldHQuY29tL3RpbC8yMDE2LzA4LzE5L2QzLXBpZS1jaGFydC5odG1sXHJcblx0XHQqL1xyXG5cdFx0Y29uc3QgYXJjID0gZDNcclxuXHRcdFx0LmFyYygpXHJcblx0XHRcdC5vdXRlclJhZGl1cyhyYWRpdXMpXHJcblx0XHRcdC5pbm5lclJhZGl1cygwKVxyXG5cclxuXHRcdGNvbnN0IHBpZSA9IGQzXHJcblx0XHRcdC5waWUoKVxyXG5cdFx0XHQuc29ydChudWxsKVxyXG5cdFx0XHQudmFsdWUoZCA9PiBkLnRvdGFsKVxyXG5cdFx0LyogPT09IEVuZCBzb3VyY2UgPT09ICovXHJcblxyXG5cdFx0Y29uc3QgY2hhcnQgPSBkMy5zZWxlY3QoYCMke2VsZW1lbnR9IC5wYXJlbnRgKVxyXG5cclxuXHRcdGNvbnN0IHBhdGggPSBjaGFydC5zZWxlY3RBbGwoJ3BhdGgnKS5kYXRhKHBpZShkYXRhKSlcclxuXHJcblx0XHRwYXRoXHJcblx0XHRcdC5lbnRlcigpXHJcblx0XHRcdC5hcHBlbmQoJ3BhdGgnKVxyXG5cdFx0XHQuYXR0cigndGl0bGUnLCAoZCwgaSkgPT4gZC5kYXRhLnRpdGxlKVxyXG5cdFx0XHQub24oJ21vdXNlb3ZlcicsIGQgPT5cclxuXHRcdFx0XHR0b29sdGlwLnNob3coZWxlbWVudCwgYCR7ZC5kYXRhLnRpdGxlfTogJHtkLnZhbHVlfSBib29rc2ApXHJcblx0XHRcdClcclxuXHRcdFx0Lm9uKCdtb3VzZW91dCcsICgpID0+IHRvb2x0aXAuaGlkZShlbGVtZW50KSlcclxuXHRcdFx0LnN0eWxlKCdmaWxsJywgKGQsIGkpID0+IGNvbG9yKGkpKVxyXG5cdFx0XHQvKiBTYXZlcyBpbml0aWFsIGFyYyB2YWx1ZSwgYnkgZXhhbXBsZSBmcm9tIE1pa2UgQm9zdG9jayAoaHR0cHM6Ly9ibC5vY2tzLm9yZy9tYm9zdG9jay8xMzQ2NDEwKSAqL1xyXG5cdFx0XHQuZWFjaCgoZCwgaSwgYWxsKSA9PiAoYWxsW2ldLl9jdXJyZW50ID0gZCkpXHJcblx0XHRcdC50cmFuc2l0aW9uKClcclxuXHRcdFx0LmR1cmF0aW9uKDUwMClcclxuXHRcdFx0LmF0dHJUd2VlbignZCcsIGVudGVyVHdlZW4pXHJcblxyXG5cdFx0cGF0aFxyXG5cdFx0XHQudHJhbnNpdGlvbigpXHJcblx0XHRcdC5zdHlsZSgnZmlsbCcsIChkLCBpKSA9PiBjb2xvcihpKSlcclxuXHRcdFx0LmR1cmF0aW9uKDUwMClcclxuXHRcdFx0LmF0dHJUd2VlbignZCcsIGFyY1R3ZWVuKVxyXG5cclxuXHRcdHBhdGguZXhpdCgpLnJlbW92ZSgpXHJcblxyXG5cdFx0Ly8gc2FtZSBhcyBuZXh0IGZ1bmN0aW9uIGJ1dCBzdGlsbCBkb24ndCBrbm93IGhvdyB0byB3b3JrIHdpdGggbmV4dCBmdW5jdGlvbiB0byBnbyBmcm9tIDAgb24gZW50ZXJcclxuXHRcdGZ1bmN0aW9uIGVudGVyVHdlZW4oZCkge1xyXG5cdFx0XHRkLmlubmVyUmFkaXVzID0gMFxyXG5cdFx0XHR2YXIgaSA9IGQzLmludGVycG9sYXRlKHsgc3RhcnRBbmdsZTogMCwgZW5kQW5nbGU6IDAgfSwgZClcclxuXHRcdFx0cmV0dXJuIHQgPT4gYXJjKGkodCkpXHJcblx0XHR9XHJcblx0XHQvKlxyXG5cdFx0PT09IFN0YXJ0IHNvdXJjZSA9PT1cclxuXHRcdEludGVycG9sYXRlIGJldHdlZW4gcHJldmlvdXMgZW5kcG9pbnQgb2YgZGF0YXBvaW50IGFyYyBhbmQgbmV3IGVuZHBvaW50XHJcblx0XHRGcm9tIGFuIGV4YW1wbGUgYnkgTWlrZSBCb3N0b2NrXHJcblx0XHR2aWEgaHR0cHM6Ly9ibC5vY2tzLm9yZy9tYm9zdG9jay8xMzQ2NDEwXHJcblx0XHQqL1xyXG5cdFx0ZnVuY3Rpb24gYXJjVHdlZW4oZCkge1xyXG5cdFx0XHRjb25zdCBpID0gZDMuaW50ZXJwb2xhdGUodGhpcy5fY3VycmVudCwgZClcclxuXHRcdFx0dGhpcy5fY3VycmVudCA9IGkoMClcclxuXHRcdFx0cmV0dXJuIHQgPT4gYXJjKGkodCkpXHJcblx0XHR9XHJcblx0XHQvKiA9PT0gRW5kIHNvdXJjZSA9PT0gKi9cclxuXHR9LFxyXG5cclxuXHQvKiBNYWtlcyBzdXJlIHRoZSBwaWUgY2hhcnRzICh3aGljaCBhcmUgcmVuZGVyZWQgbmV4dCB0byBlYWNob3RoZXIpIGRvbid0IGV4Y2VlZCB0aGVpciBjb250YWluZXIgbGltaXQuXHJcblx0IE9uIG1vYmlsZSBtYWtlcyBzdXJlIHRoZSBjaGFydHMgYXJlIGhhbGYgb2YgdGhlIHZpZXdwb3J0IHdpdGggYSBsZWZ0b3ZlciBzcGFjZSBvZiA1MCBlYWNoICovXHJcblx0d2lkdGgoKSB7XHJcblx0XHRyZXR1cm4gd2luZG93LmlubmVyV2lkdGggLSAxMDAgPiA0MCAqIDE2XHJcblx0XHRcdD8gMjAwXHJcblx0XHRcdDogKHdpbmRvdy5pbm5lcldpZHRoIC0gMTAwKSAvIDJcclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gcGllXHJcbiIsIi8qIGdsb2JhbCBkMyAqL1xyXG5jb25zdCBzdGF0ZSA9IHJlcXVpcmUoJy4uL3N0YXRlLmpzJylcclxuXHJcbmNvbnN0IGNpdHkgPSB7XHJcblx0Y29uZmlndXJlKG1hcGJveCkge1xyXG5cdFx0dGhpcy5tYXBib3ggPSBtYXBib3hcclxuXHR9LFxyXG5cdHNob3coY2l0eSwgaW5kZXgsIGFsbCkge1xyXG5cdFx0c3RhdGUuc2V0KCdjaXR5Jywge1xyXG5cdFx0XHRuYW1lOiBjaXR5LmtleSxcclxuXHRcdFx0YW1vdW50OiBjaXR5LnRvdGFsLFxyXG5cdFx0XHRwdWJsaXNoZXJzOiBjaXR5LnZhbHVlc1xyXG5cdFx0XHRcdC5tYXAocHVibGlzaGVyID0+ICh7XHJcblx0XHRcdFx0XHR0aXRsZTogcHVibGlzaGVyLmtleSxcclxuXHRcdFx0XHRcdHRvdGFsOiBwdWJsaXNoZXIudmFsdWVzLmxlbmd0aFxyXG5cdFx0XHRcdH0pKVxyXG5cdFx0XHRcdC5zb3J0KChhLCBiKSA9PiBhLnRvdGFsIC0gYi50b3RhbClcclxuXHRcdH0pXHJcblxyXG5cdFx0c3RhdGUuY2l0eS5wdWJsaXNoZXJzLmxlbmd0aCA8PSAxID8gc3RhdGUuc2V0KCdzaG93YmFyJywgZmFsc2UpIDogZmFsc2VcclxuXHJcblx0XHQvKiBNYWtlIHRoZSBjbGlja2VkIGNpcmNsZSBmdWxsIGNvbG9yICovXHJcblx0XHRkMy5zZWxlY3RBbGwoJ2NpcmNsZScpLnN0eWxlKCdvcGFjaXR5JywgJycpXHJcblx0XHRkMy5zZWxlY3QoYWxsW2luZGV4XSkuc3R5bGUoJ29wYWNpdHknLCAxKVxyXG5cclxuXHRcdC8qIE9uIG1vYmlsZSwgcHV0IHRoZSBtYXAgY2VudGVyIG1vcmUgdG8gdGhlIHRvcCBvZiB0aGUgc2NyZWVuIHRvIGFjY29tb2RhdGUgZm9yIHRoZSBjaXR5IGluZm8gZGl2ICovXHJcblx0XHRjb25zdCBjZW50ZXIgPVxyXG5cdFx0XHR3aW5kb3cuaW5uZXJXaWR0aCA+IDQwICogMTZcclxuXHRcdFx0XHQ/IFtjaXR5LmNvb3Jkc1swXSwgY2l0eS5jb29yZHNbMV1dXHJcblx0XHRcdFx0OiBbY2l0eS5jb29yZHNbMF0sIGNpdHkuY29vcmRzWzFdIC0gMC4zXVxyXG5cclxuXHRcdHRoaXMubWFwYm94LmZseVRvKHtcclxuXHRcdFx0Y2VudGVyLFxyXG5cdFx0XHRzcGVlZDogMC4zLFxyXG5cdFx0XHRjdXJ2ZTogMixcclxuXHRcdFx0em9vbTogOFxyXG5cdFx0fSlcclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gY2l0eVxyXG4iLCIvKiBnbG9iYWwgZDMgKi9cclxuY29uc3QgdG9vbHRpcCA9IHtcclxuXHRzaG93KGVsZW1lbnQsIHRleHQpIHtcclxuXHRcdGQzLnNlbGVjdChgIyR7ZWxlbWVudH0gLnRvb2x0aXBgKVxyXG5cdFx0XHQuc3R5bGUoXHJcblx0XHRcdFx0J2xlZnQnLFxyXG5cdFx0XHRcdGAke2QzLmV2ZW50LnBhZ2VYfXB4YFxyXG5cdFx0XHQpIC8qIGQzLmV2ZW50IGxlYXJuZWQgZnJvbSBkZW5uaXN3ZWdlcmVlZiAoaHR0cHM6Ly9naXRodWIuY29tL2Rlbm5pc3dlZ2VyZWVmKSAqL1xyXG5cdFx0XHQuc3R5bGUoXHJcblx0XHRcdFx0J3RvcCcsXHJcblx0XHRcdFx0YCR7ZDMuZXZlbnQucGFnZVkgLSAzMH1weGBcclxuXHRcdFx0KSAvKiBkMy5ldmVudCBsZWFybmVkIGZyb20gZGVubmlzd2VnZXJlZWYgKGh0dHBzOi8vZ2l0aHViLmNvbS9kZW5uaXN3ZWdlcmVlZikgKi9cclxuXHRcdFx0LnRyYW5zaXRpb24oKVxyXG5cdFx0XHQuZHVyYXRpb24oMzAwKVxyXG5cdFx0XHQuc3R5bGUoJ29wYWNpdHknLCAwLjgpXHJcblx0XHRcdC5zZWxlY3QoJ2g0JylcclxuXHRcdFx0LnRleHQodGV4dClcclxuXHR9LFxyXG5cdGhpZGUoZWxlbWVudCkge1xyXG5cdFx0ZDMuc2VsZWN0KGAjJHtlbGVtZW50fSAudG9vbHRpcGApXHJcblx0XHRcdC50cmFuc2l0aW9uKClcclxuXHRcdFx0LmR1cmF0aW9uKDMwMClcclxuXHRcdFx0LnN0eWxlKCdvcGFjaXR5JywgMClcclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gdG9vbHRpcFxyXG4iLCIvKiBnbG9iYWwgZDMgKi9cclxuY29uc3Qgc3RhdGUgPSByZXF1aXJlKCcuLi9zdGF0ZS5qcycpXHJcbmNvbnN0IGhlbHBlciA9IHtcclxuXHQvKlxyXG5cdD09PSBTdGFydCBzb3VyY2UgPT09XHJcblx0TWFrZSByYW5nZSBvZiBjb2xvcnMgdG8gdXNlIHdoZW4gcmVuZGVyaW5nIGl0ZW1zIGluIGEgYmFyIGNoYXJ0IG9yIHBpZSBjaGFydFxyXG5cdEJhc2VkIG9uIGV4YW1wbGVzIGJ5IEplcm9tZSBDdWtpZXIgYW5kIHRoZSBkMyBkb2N1bWVudGF0aW9uXHJcblx0dmlhIGh0dHBzOi8vZ2l0aHViLmNvbS9kMy9kMy1zY2FsZSNjb250aW51b3VzLXNjYWxlc1xyXG5cdHZpYSBodHRwOi8vd3d3Lmplcm9tZWN1a2llci5uZXQvMjAxMS8wOC8xMS9kMy1zY2FsZXMtYW5kLWNvbG9yL1xyXG5cdCovXHJcblx0Y29sb3IoZGF0YSkge1xyXG5cdFx0cmV0dXJuIGQzXHJcblx0XHRcdC5zY2FsZUxpbmVhcigpXHJcblx0XHRcdC5kb21haW4oWzAsIE1hdGgucm91bmQoZGF0YS5sZW5ndGggLyAyKSwgZGF0YS5sZW5ndGhdKVxyXG5cdFx0XHQucmFuZ2UoWycjQkJFNEEwJywgJyM1MkE4QUYnLCAnIzAwMzA1QyddKVxyXG5cdH0sXHJcblx0LyogPT09IEVuZCBzb3VyY2UgPT09ICovXHJcblxyXG5cdGdyb3VwQ2l0aWVzKGRhdGEsIGNvb3JkaW5hdGVzKSB7XHJcblx0XHRjb25zdCBjaXRpZXMgPSBkM1xyXG5cdFx0XHQubmVzdCgpXHJcblx0XHRcdC5rZXkoYm9vayA9PiBib29rLnB1YmxpY2F0aW9uLnBsYWNlKVxyXG5cdFx0XHQua2V5KGJvb2sgPT4gYm9vay5wdWJsaWNhdGlvbi5wdWJsaXNoZXIpXHJcblx0XHRcdC5lbnRyaWVzKGRhdGEpXHJcblx0XHRcdC5tYXAoY2l0eSA9PiB7XHJcblx0XHRcdFx0LyogbWF0Y2ggZXF1YWxzIHRydWUgaWYgY2l0eSBpcyBpbiBjb29yZGluYXRlcyBkYXRhYmFzZSAqL1xyXG5cdFx0XHRcdGNvbnN0IG1hdGNoID0gY29vcmRpbmF0ZXMuZmluZChcclxuXHRcdFx0XHRcdHBsYWNlID0+IHBsYWNlLmNpdHkudG9Mb3dlckNhc2UoKSA9PT0gY2l0eS5rZXkudG9Mb3dlckNhc2UoKVxyXG5cdFx0XHRcdClcclxuXHRcdFx0XHRpZiAoIW1hdGNoKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gbnVsbFxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRjb25zdCB0b3RhbCA9IGNpdHkudmFsdWVzXHJcblx0XHRcdFx0XHQubWFwKHB1Ymxpc2hlciA9PiBwdWJsaXNoZXIudmFsdWVzLmxlbmd0aClcclxuXHRcdFx0XHRcdC5yZWR1Y2UoKGEsIGIpID0+IGEgKyBiLCAwKVxyXG5cclxuXHRcdFx0XHRjb25zdCBjb29yZHMgPSBbTnVtYmVyKG1hdGNoLmxuZyksIE51bWJlcihtYXRjaC5sYXQpXVxyXG5cclxuXHRcdFx0XHRyZXR1cm4ge1xyXG5cdFx0XHRcdFx0Li4uY2l0eSxcclxuXHRcdFx0XHRcdHRvdGFsLFxyXG5cdFx0XHRcdFx0Y29vcmRzXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KVxyXG5cdFx0XHQuZmlsdGVyKGNpdHkgPT4gY2l0eSAhPT0gbnVsbClcclxuXHRcdHJldHVybiBjaXRpZXNcclxuXHR9LFxyXG5cclxuXHRmaWx0ZXJHZW5yZShnZW5yZSkge1xyXG5cdFx0bGV0IGRhdGFcclxuXHJcblx0XHRpZiAoZ2VucmUgPT09ICdhbGwnKSB7XHJcblx0XHRcdGRhdGEgPSBzdGF0ZS5kYXRhLnRvdGFsXHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRkYXRhID0gc3RhdGUuZGF0YS50b3RhbC5maWx0ZXIoYm9vayA9PiBib29rLmdlbnJlcy5pbmNsdWRlcyhnZW5yZSkpXHJcblx0XHR9XHJcblxyXG5cdFx0ZDMuc2VsZWN0QWxsKCdjaXJjbGUnKVxyXG5cdFx0XHQuc3R5bGUoJ2ZpbGwnLCAnJylcclxuXHRcdFx0LnN0eWxlKCdzdHJva2UnLCAnJylcclxuXHJcblx0XHRzdGF0ZS5zZXQoJ2NpdHknLCB7XHJcblx0XHRcdC4uLnN0YXRlLmNpdHksXHJcblx0XHRcdG5hbWU6ICcnXHJcblx0XHR9KVxyXG5cdFx0c3RhdGUuc2V0KCdzaG93YmFyJywgZmFsc2UpXHJcblx0XHRzdGF0ZS5zZXQoJ2RhdGEnLCB7XHJcblx0XHRcdC4uLnN0YXRlLmRhdGEsXHJcblx0XHRcdGNpdGllczogdGhpcy5ncm91cENpdGllcyhkYXRhLCBzdGF0ZS5kYXRhLmNvb3JkaW5hdGVzKSxcclxuXHRcdFx0YW1vdW50OiBkYXRhLmxlbmd0aFxyXG5cdFx0fSlcclxuXHR9LFxyXG5cclxuXHRmb3JtYXREYXRhKHJlc3VsdHMpIHtcclxuXHRcdGNvbnN0IGNvb3JkaW5hdGVzID0gcmVzdWx0c1swXS5jb25jYXQocmVzdWx0c1sxXSlcclxuXHJcblx0XHRjb25zdCBoYXNQdWJsaWNhdGlvbiA9IHJlc3VsdHNbMl1cclxuXHRcdFx0LmZpbHRlcihib29rID0+IGJvb2sucHVibGljYXRpb24ucGxhY2UgJiYgYm9vay5wdWJsaWNhdGlvbi5wdWJsaXNoZXIpXHJcblx0XHRcdC5tYXAoYm9vayA9PiB7XHJcblx0XHRcdFx0LyogTWFrZSBzdXJlIHJhbmRvbSBjaGFyYWN0ZXJzIGFyZSByZW1vdmVkIGZyb20gdGhlIHB1YmxpY2F0aW9uIGNpdHkgbmFtZSAqL1xyXG5cdFx0XHRcdGJvb2sucHVibGljYXRpb24ucGxhY2UgPSBib29rLnB1YmxpY2F0aW9uLnBsYWNlXHJcblx0XHRcdFx0XHQucmVwbGFjZSgvW15hLXpBLVosXFxzXSsvZywgJycpXHJcblx0XHRcdFx0XHQudHJpbSgpXHJcblx0XHRcdFx0XHQuc3BsaXQoJywnKVswXVxyXG5cdFx0XHRcdC8qIE1ha2Ugc3VyZSBpbmNvbnNpc3RlbmNpZXMgaW4gbmFtaW5nIG9mIHB1Ymxpc2hlcnMgZ2V0IGdyb3VwZWQgdG9nZXRoZXIgKi9cclxuXHRcdFx0XHRib29rLnB1YmxpY2F0aW9uLnB1Ymxpc2hlciA9IGJvb2sucHVibGljYXRpb24ucHVibGlzaGVyXHJcblx0XHRcdFx0XHQucmVwbGFjZSgvW15hLXpBLVosXFxzXSsvZywgJycpXHJcblx0XHRcdFx0XHQucmVwbGFjZSgnVWl0Z2V2ZXJpaicsICcnKVxyXG5cdFx0XHRcdFx0LnJlcGxhY2UoJ3VpdGdldmVyaWonLCAnJylcclxuXHRcdFx0XHRcdC50cmltKClcclxuXHRcdFx0XHRcdC5zcGxpdCgnLCcpWzBdXHJcblx0XHRcdFx0XHQudG9Mb3dlckNhc2UoKVxyXG5cdFx0XHRcdFx0LypcclxuXHRcdFx0XHRcdD09PSBTdGFydCBzb3VyY2UgPT09XHJcblx0XHRcdFx0XHRDYXBpdGFsaXplIGZpcnN0IGxldHRlciBpbiBhIHN0cmluZ1xyXG5cdFx0XHRcdFx0ZnJvbSBhbiBleGFtcGxlIGJ5IEpvc2ggVHJvbmljXHJcblx0XHRcdFx0XHR2aWEgaHR0cHM6Ly9qb3NodHJvbmljLmNvbS8yMDE2LzAyLzE0L2hvdy10by1jYXBpdGFsaXplLXRoZS1maXJzdC1sZXR0ZXItaW4tYS1zdHJpbmctaW4tamF2YXNjcmlwdC9cclxuXHRcdFx0XHRcdCovXHJcblx0XHRcdFx0XHQucmVwbGFjZSgvXlxcdy8sIGMgPT4gYy50b1VwcGVyQ2FzZSgpKVxyXG5cdFx0XHRcdC8qID09PSBFbmQgc291cmNlID09PSAqL1xyXG5cdFx0XHRcdHJldHVybiBib29rXHJcblx0XHRcdH0pXHJcblxyXG5cdFx0Y29uc3QgZ2VucmVzID0gaGFzUHVibGljYXRpb25cclxuXHRcdFx0Lm1hcChib29rID0+IGJvb2suZ2VucmVzKVxyXG5cdFx0XHQucmVkdWNlKCh0b3RhbCwgYm9va0dlbnJlcykgPT4gdG90YWwuY29uY2F0KGJvb2tHZW5yZXMpLCBbXSlcclxuXHRcdFx0LnNvcnQoKVxyXG5cclxuXHRcdGNvbnN0IGNpdGllcyA9IHRoaXMuZ3JvdXBDaXRpZXMoaGFzUHVibGljYXRpb24sIGNvb3JkaW5hdGVzKVxyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0Y2l0aWVzOiBjaXRpZXMsXHJcblx0XHRcdC8qIEhlcmUgbmV3IFNldCBnZW5lcmF0ZXMgYW4gYXJyYXkgd2l0aCBvbmx5IHVuaXF1ZSB2YWx1ZXMgZnJvbSBhIGRpZmZlcmVudCBhcnJheSAqL1xyXG5cdFx0XHRnZW5yZXM6IFsuLi5uZXcgU2V0KGdlbnJlcyldLFxyXG5cdFx0XHRhbW91bnQ6IGhhc1B1YmxpY2F0aW9uLmxlbmd0aCxcclxuXHRcdFx0dG90YWw6IGhhc1B1YmxpY2F0aW9uLFxyXG5cdFx0XHRjb29yZGluYXRlczogY29vcmRpbmF0ZXNcclxuXHRcdH1cclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gaGVscGVyXHJcbiIsImNvbnN0IHN0YXRlID0ge1xyXG5cdHNldChwcm9wZXJ0eSwgdmFsdWUpIHtcclxuXHRcdHRoaXNbcHJvcGVydHldID0gdmFsdWVcclxuXHR9LFxyXG5cdGxvYWRlZDogZmFsc2UsXHJcblx0Y3VycmVudENpdHk6IDAsXHJcblx0c2hvd2JhcjogZmFsc2UsXHJcblx0ZnVsbHNjcmVlbjogZmFsc2UsXHJcblx0ZGF0YToge1xyXG5cdFx0Z2VucmVzOiBbXSxcclxuXHRcdGFtb3VudDogMCxcclxuXHRcdGNpdGllczogW10sXHJcblx0XHR0b3RhbDogW11cclxuXHR9LFxyXG5cdGNpdHk6IHtcclxuXHRcdG5hbWU6ICcnLFxyXG5cdFx0YW1vdW50OiAwLFxyXG5cdFx0cHVibGlzaGVyczogW11cclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gc3RhdGVcclxuIiwiLyogZ2xvYmFsIGQzIFZ1ZSBtYXBib3hnbCAqL1xyXG5jb25zdCBzdGF0ZSA9IHJlcXVpcmUoJy4vc3RhdGUuanMnKVxyXG5jb25zdCBtYXAgPSByZXF1aXJlKCcuL2QzL21hcC5qcycpXHJcbmNvbnN0IHBpZSA9IHJlcXVpcmUoJy4vZDMvcGllLmpzJylcclxuY29uc3QgaGVscGVyID0gcmVxdWlyZSgnLi9oZWxwZXJzL2hlbHBlci5qcycpXHJcbmNvbnN0IGxheW91dCA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy92dWUuanMnKVxyXG5cclxubGF5b3V0KClcclxuXHJcbm1hcGJveGdsLmFjY2Vzc1Rva2VuID1cclxuXHQncGsuZXlKMUlqb2labXAyWkhCdmJDSXNJbUVpT2lKamFtOW1jVzFoTW1Vd05tODFNM0Z2T1c5dk1ETTVNbTVpSW4wLjV4VlBZZDkzVFpRRXlxY2hETU5CdHcnXHJcblxyXG5jb25zdCBtYXBib3ggPSBuZXcgbWFwYm94Z2wuTWFwKHtcclxuXHRjb250YWluZXI6ICdtYXAnLFxyXG5cdHN0eWxlOiAnbWFwYm94Oi8vc3R5bGVzL2ZqdmRwb2wvY2pvandiY201MGRrYzJydGZvM200dnM2aScsXHJcblx0Y2VudGVyOiBbNC44OTk0MzEsIDUyLjM3OTE4OV0sXHJcblx0em9vbTogNSxcclxuXHRwaXRjaDogNDAsXHJcblx0bWluWm9vbTogMlxyXG59KVxyXG5cclxubWFwYm94Lm9uKCdsb2FkJywgKCkgPT4ge1xyXG5cdFByb21pc2UuYWxsKFtcclxuXHRcdGQzLmNzdignZGF0YS9jb2Rlc25ldGhlcmxhbmRzLmNzdicpLFxyXG5cdFx0ZDMuY3N2KCdkYXRhL3dvcmxkY2l0aWVzLmNzdicpLFxyXG5cdFx0ZDMuanNvbignZGF0YS9kYXRhLmpzb24nKVxyXG5cdF0pXHJcblx0XHQudGhlbihyZXN1bHRzID0+IHtcclxuXHRcdFx0c3RhdGUuc2V0KCdkYXRhJywgaGVscGVyLmZvcm1hdERhdGEocmVzdWx0cykpXHJcblxyXG5cdFx0XHRtYXAuY29uZmlndXJlKG1hcGJveClcclxuXHRcdFx0bWFwLmNyZWF0ZShzdGF0ZS5kYXRhLmNpdGllcylcclxuXHJcblx0XHRcdHN0YXRlLnNldCgnbG9hZGVkJywgdHJ1ZSlcclxuXHJcblx0XHRcdG1hcGJveC5mbHlUbyh7XHJcblx0XHRcdFx0em9vbTogNixcclxuXHRcdFx0XHRzcGVlZDogMC40XHJcblx0XHRcdH0pXHJcblx0XHR9KVxyXG5cdFx0LmNhdGNoKGVyciA9PiB7XHJcblx0XHRcdGNvbnNvbGUubG9nKGVycilcclxuXHRcdH0pXHJcbn0pXHJcbiJdfQ==
