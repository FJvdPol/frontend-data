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

    var chart = d3.select("#".concat(element, " .parent"));
    var rect = chart.selectAll('rect').data(data);
    rect.enter().append('rect').attr('title', function (d, i) {
      return d.title;
    }).on('mouseover', function (d) {
      return tooltip.show(element, "".concat(d.title, ": ").concat(d.total, " books"));
    }).on('mouseout', function () {
      return tooltip.hide(element);
    })
    /* merge function learned from this great video by Curran Kelleher: https://www.youtube.com/watch?v=IyIAR65G-GQ */
    .merge(rect).attr('width', x.bandwidth()).attr('height', 0).attr('x', function (d) {
      return x(d.title);
    }).attr('y', function (d) {
      return _this.height() - _this.margin.bottom;
    }).style('fill', function (d, i) {
      return color(i);
    }).transition().duration(500).delay(function (d, i, all) {
      return i * (Math.round(100 / all.length) + 1);
    }).attr('y', function (d) {
      return y(d.total);
    }).attr('height', function (d) {
      return y(0) - y(d.total);
    });
    rect.exit().transition().duration(500).attr('height', 0).attr('y', function (d) {
      return _this.height() - _this.margin.bottom;
    }).remove();
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

    var duration = 500;
    var chart = d3.select("#".concat(element, " svg g"));
    var circles = chart.selectAll('circle').data(data, function (d) {
      return d.key;
    });
    circles.enter().append('circle').on('mouseover', function (d) {
      return tooltip.show(element, "".concat(d.key, ": ").concat(d.total, " books"));
    }).on('mouseout', function () {
      return tooltip.hide(element);
    }).on('click', function (d, i, all) {
      tooltip.hide(element);
      city.show(d, i, all);
    }).attr('r', 0).attr('cx', function (d) {
      return _this3.project(d.coords).x;
    }).attr('cy', function (d) {
      return _this3.project(d.coords).y;
    }).style('opacity', 0.5)
    /* merge function learned from this great video by Curran Kelleher: https://www.youtube.com/watch?v=IyIAR65G-GQ */
    .merge(circles).transition().duration(duration).attr('r', function (d) {
      return _this3.radius(d.total);
    });
    circles.exit().transition().duration(duration).attr('r', 0).remove();
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
    var path = chart.selectAll('path').data(pie(data), function (d, i) {
      return 'path' + i;
    });
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

    d3.selectAll('circle').style('opacity', 0.5);
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

    d3.selectAll('circle').style('opacity', '0.5');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY29tcG9uZW50cy92dWUuanMiLCJzcmMvZDMvYmFyLmpzIiwic3JjL2QzL21hcC5qcyIsInNyYy9kMy9waWUuanMiLCJzcmMvZDMvc2hvd2NpdHkuanMiLCJzcmMvZDMvdG9vbHRpcC5qcyIsInNyYy9oZWxwZXJzL2hlbHBlci5qcyIsInNyYy9zdGF0ZS5qcyIsImluZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxJQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsYUFBRCxDQUFyQjs7QUFDQSxJQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsY0FBRCxDQUFuQjs7QUFDQSxJQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsY0FBRCxDQUFuQjs7QUFDQSxJQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsY0FBRCxDQUFuQjs7QUFDQSxJQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsc0JBQUQsQ0FBdEI7O0FBRUEsTUFBTSxDQUFDLE9BQVAsR0FBaUIsWUFBTTtBQUN0QixFQUFBLEdBQUcsQ0FBQyxTQUFKLENBQWMsUUFBZCxFQUF3QjtBQUN2QixJQUFBLEtBQUssRUFBRSxDQUFDLE1BQUQsQ0FEZ0I7QUFFdkIsSUFBQSxRQUFRLEVBQUU7QUFGYSxHQUF4QjtBQUtBLEVBQUEsR0FBRyxDQUFDLFNBQUosQ0FBYyxXQUFkLEVBQTJCO0FBQzFCLElBQUEsS0FBSyxFQUFFLENBQUMsTUFBRCxFQUFTLElBQVQsQ0FEbUI7QUFFMUIsSUFBQSxPQUYwQixxQkFFaEI7QUFDVCxNQUFBLEdBQUcsQ0FBQyxJQUFKLENBQVMsS0FBSyxFQUFkLEVBQWtCLEtBQUssSUFBdkI7QUFDQSxLQUp5QjtBQUsxQixJQUFBLEtBQUssRUFBRTtBQUNOLE1BQUEsSUFETSxrQkFDQztBQUNOLFFBQUEsR0FBRyxDQUFDLE1BQUosQ0FBVyxLQUFLLEVBQWhCLEVBQW9CLEtBQUssSUFBekI7QUFDQTtBQUhL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SCxDQUFPLDJCQUFQLENBRFcsRUFFWCxFQUFFLENBQUMsR0FBSCxDQUFPLHNCQUFQLENBRlcsRUFHWCxFQUFFLENBQUMsSUFBSCxDQUFRLGdCQUFSLENBSFcsQ0FBWixFQUtFLElBTEYsQ0FLTyxVQUFBLE9BQU8sRUFBSTtBQUNoQixJQUFBLEtBQUssQ0FBQyxHQUFOLENBQVUsTUFBVixFQUFrQixNQUFNLENBQUMsVUFBUCxDQUFrQixPQUFsQixDQUFsQjtBQUVBLElBQUEsR0FBRyxDQUFDLFNBQUosQ0FBYyxNQUFkO0FBQ0EsSUFBQSxHQUFHLENBQUMsTUFBSixDQUFXLEtBQUssQ0FBQyxJQUFOLENBQVcsTUFBdEI7QUFFQSxJQUFBLEtBQUssQ0FBQyxHQUFOLENBQVUsUUFBVixFQUFvQixJQUFwQjtBQUVBLElBQUEsTUFBTSxDQUFDLEtBQVAsQ0FBYTtBQUNaLE1BQUEsSUFBSSxFQUFFLENBRE07QUFFWixNQUFBLEtBQUssRUFBRTtBQUZLLEtBQWI7QUFJQSxHQWpCRixFQWtCRSxLQWxCRixDQWtCUSxVQUFBLEdBQUcsRUFBSTtBQUNiLElBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxHQUFaO0FBQ0EsR0FwQkY7QUFxQkEsQ0F0QkQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJjb25zdCBzdGF0ZSA9IHJlcXVpcmUoJy4uL3N0YXRlLmpzJylcclxuY29uc3QgbWFwID0gcmVxdWlyZSgnLi4vZDMvbWFwLmpzJylcclxuY29uc3QgcGllID0gcmVxdWlyZSgnLi4vZDMvcGllLmpzJylcclxuY29uc3QgYmFyID0gcmVxdWlyZSgnLi4vZDMvYmFyLmpzJylcclxuY29uc3QgaGVscGVyID0gcmVxdWlyZSgnLi4vaGVscGVycy9oZWxwZXIuanMnKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSAoKSA9PiB7XHJcblx0VnVlLmNvbXBvbmVudCgnbG9hZGVyJywge1xyXG5cdFx0cHJvcHM6IFsndGV4dCddLFxyXG5cdFx0dGVtcGxhdGU6ICc8aDI+e3sgdGV4dCB9fTwvaDI+J1xyXG5cdH0pXHJcblxyXG5cdFZ1ZS5jb21wb25lbnQoJ3BpZS1jaGFydCcsIHtcclxuXHRcdHByb3BzOiBbJ2RhdGEnLCAnaWQnXSxcclxuXHRcdG1vdW50ZWQoKSB7XHJcblx0XHRcdHBpZS5kcmF3KHRoaXMuaWQsIHRoaXMuZGF0YSlcclxuXHRcdH0sXHJcblx0XHR3YXRjaDoge1xyXG5cdFx0XHRkYXRhKCkge1xyXG5cdFx0XHRcdHBpZS51cGRhdGUodGhpcy5pZCwgdGhpcy5kYXRhKVxyXG5cdFx0XHR9XHJcblx0XHR9LFxyXG5cdFx0dGVtcGxhdGU6ICc8ZGl2IDppZD1cInRoaXMuaWRcIj48L2Rpdj4nXHJcblx0fSlcclxuXHJcblx0VnVlLmNvbXBvbmVudCgnYmFyLWNoYXJ0Jywge1xyXG5cdFx0cHJvcHM6IFsnc2NyZWVuJywgJ2RhdGEnLCAnaWQnXSxcclxuXHRcdG1vdW50ZWQoKSB7XHJcblx0XHRcdGJhci5kcmF3KHRoaXMuaWQsIHRoaXMuZGF0YSlcclxuXHRcdH0sXHJcblx0XHR3YXRjaDoge1xyXG5cdFx0XHRkYXRhKCkge1xyXG5cdFx0XHRcdGJhci51cGRhdGUodGhpcy5pZCwgdGhpcy5kYXRhKVxyXG5cdFx0XHR9LFxyXG5cdFx0XHRzY3JlZW4oKSB7XHJcblx0XHRcdFx0ZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgIyR7dGhpcy5pZH1gKS5pbm5lckhUTUwgPSAnJ1xyXG5cdFx0XHRcdGJhci5kcmF3KHRoaXMuaWQsIHRoaXMuZGF0YSlcclxuXHRcdFx0fVxyXG5cdFx0fSxcclxuXHRcdHRlbXBsYXRlOiAnPGRpdiA6aWQ9XCJ0aGlzLmlkXCI+PC9kaXY+J1xyXG5cdH0pXHJcblxyXG5cdGNvbnN0IGFwcCA9IG5ldyBWdWUoe1xyXG5cdFx0ZWw6ICcjYXBwJyxcclxuXHRcdGRhdGEoKSB7XHJcblx0XHRcdHJldHVybiBzdGF0ZVxyXG5cdFx0fSxcclxuXHRcdG1ldGhvZHM6IHtcclxuXHRcdFx0Y2hhbmdlRmlsdGVyOiBlID0+IHtcclxuXHRcdFx0XHRoZWxwZXIuZmlsdGVyR2VucmUoZS50YXJnZXQudmFsdWUpXHJcblx0XHRcdFx0bWFwLnVwZGF0ZSgnbWFwJywgc3RhdGUuZGF0YS5jaXRpZXMpXHJcblx0XHRcdH0sXHJcblx0XHRcdG1ldGFkYXRhQ2xhc3M6ICgpID0+IHtcclxuXHRcdFx0XHRpZiAoc3RhdGUuY2l0eS5uYW1lICYmIHN0YXRlLnNob3diYXIpIHtcclxuXHRcdFx0XHRcdHJldHVybiAnbWV0YWRhdGEtaG9sZGVyIGNpdHknXHJcblx0XHRcdFx0fSBlbHNlIGlmIChzdGF0ZS5jaXR5Lm5hbWUpIHtcclxuXHRcdFx0XHRcdHJldHVybiAnbWV0YWRhdGEtaG9sZGVyIGNpdHkgZnVsbCdcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0cmV0dXJuICdtZXRhZGF0YS1ob2xkZXInXHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9KVxyXG59XHJcbiIsImNvbnN0IHRvb2x0aXAgPSByZXF1aXJlKCcuL3Rvb2x0aXAuanMnKVxyXG5jb25zdCBoZWxwZXIgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2hlbHBlci5qcycpXHJcbmNvbnN0IHN0YXRlID0gcmVxdWlyZSgnLi4vc3RhdGUuanMnKVxyXG5cclxuY29uc3QgYmFyID0ge1xyXG5cdG1hcmdpbjogeyB0b3A6IDIwLCByaWdodDogMzAsIGJvdHRvbTogMTAwLCBsZWZ0OiA4MCB9LFxyXG5cclxuXHRkcmF3KGVsZW1lbnQsIGRhdGEpIHtcclxuXHRcdGNvbnN0IGNoYXJ0ID0gZDMuc2VsZWN0KGAjJHtlbGVtZW50fWApXHJcblxyXG5cdFx0Y2hhcnRcclxuXHRcdFx0LmFwcGVuZCgnZGl2JylcclxuXHRcdFx0LmNsYXNzZWQoJ3Rvb2x0aXAnLCB0cnVlKVxyXG5cdFx0XHQuc3R5bGUoJ29wYWNpdHknLCAwKVxyXG5cdFx0XHQuYXBwZW5kKCdoNCcpXHJcblxyXG5cdFx0Y29uc3Qgc3ZnID0gY2hhcnRcclxuXHRcdFx0LmFwcGVuZCgnc3ZnJylcclxuXHRcdFx0LmF0dHIoJ3dpZHRoJywgdGhpcy53aWR0aCgpKVxyXG5cdFx0XHQuYXR0cignaGVpZ2h0JywgdGhpcy5oZWlnaHQoKSlcclxuXHJcblx0XHRjb25zdCBheGlzID0gc3ZnLmFwcGVuZCgnZycpLmNsYXNzZWQoJ2F4aXMnLCB0cnVlKVxyXG5cclxuXHRcdGF4aXMuYXBwZW5kKCdnJykuY2xhc3NlZCgneEF4aXMnLCB0cnVlKVxyXG5cclxuXHRcdGF4aXMuYXBwZW5kKCdnJykuY2xhc3NlZCgneUF4aXMnLCB0cnVlKVxyXG5cclxuXHRcdC8qXHJcblx0XHQ9PSBTdGFydCBzb3VyY2UgPT1cclxuXHRcdEFwcGVuZGluZyB0ZXh0IHRvIHVzZSBhcyBheGlzIHRpdGxlcy5cclxuXHRcdEZyb20gYW4gZXhhbXBsZSBieSBkM25vb2I6XHJcblx0XHRodHRwczovL2JsLm9ja3Mub3JnL2Qzbm9vYi8yM2U0MmM4ZjY3MjEwYWM2YzY3OGRiMmNkMDdhNzQ3ZVxyXG5cdFx0U21hbGwgdHdlYWtzIHRvIHdvcmsgd2l0aCBteSB2aXN1YWxpc2F0aW9uXHJcblx0XHQqL1xyXG5cdFx0YXhpc1xyXG5cdFx0XHQuYXBwZW5kKCd0ZXh0JylcclxuXHRcdFx0LmF0dHIoXHJcblx0XHRcdFx0J3RyYW5zZm9ybScsXHJcblx0XHRcdFx0YHJvdGF0ZSg5MCkgdHJhbnNsYXRlKCR7dGhpcy5oZWlnaHQoKSAtIHRoaXMubWFyZ2luLmJvdHRvbSAvIDJ9LCAkezAgLVxyXG5cdFx0XHRcdFx0dGhpcy53aWR0aCgpfSlgXHJcblx0XHRcdClcclxuXHRcdFx0LmF0dHIoJ2R5JywgJzAuNzVlbScpXHJcblx0XHRcdC5zdHlsZSgndGV4dC1hbmNob3InLCAnbWlkZGxlJylcclxuXHRcdFx0LnN0eWxlKCdjb2xvcicsICd2YXIoLS1jb2xvci1tYWluKScpXHJcblx0XHRcdC50ZXh0KCdQdWJsaXNoZXJzJylcclxuXHJcblx0XHRheGlzXHJcblx0XHRcdC5hcHBlbmQoJ3RleHQnKVxyXG5cdFx0XHQuYXR0cihcclxuXHRcdFx0XHQndHJhbnNmb3JtJyxcclxuXHRcdFx0XHRgcm90YXRlKC05MCkgdHJhbnNsYXRlKCR7MCAtXHJcblx0XHRcdFx0XHR0aGlzLmhlaWdodCgpIC8gMiArXHJcblx0XHRcdFx0XHR0aGlzLm1hcmdpbi5ib3R0b20gLyAyfSwgJHsxMH0pYFxyXG5cdFx0XHQpXHJcblx0XHRcdC5hdHRyKCdkeScsICcwLjc1ZW0nKVxyXG5cdFx0XHQuc3R5bGUoJ3RleHQtYW5jaG9yJywgJ21pZGRsZScpXHJcblx0XHRcdC5zdHlsZSgnY29sb3InLCAndmFyKC0tY29sb3ItbWFpbiknKVxyXG5cdFx0XHQudGV4dCgnQW1vdW50IG9mIGJvb2tzJylcclxuXHRcdC8qID09IEVuZCBzb3VyY2UgPT0gKi9cclxuXHJcblx0XHRzdmcuYXBwZW5kKCdnJykuY2xhc3NlZCgncGFyZW50JywgdHJ1ZSlcclxuXHJcblx0XHR0aGlzLnVwZGF0ZShlbGVtZW50LCBkYXRhKVxyXG5cdH0sXHJcblxyXG5cdHVwZGF0ZShlbGVtZW50LCBkYXRhKSB7XHJcblx0XHRjb25zdCBjb2xvciA9IGhlbHBlci5jb2xvcihkYXRhKVxyXG5cclxuXHRcdGNvbnN0IHN2ZyA9IGQzLnNlbGVjdChgIyR7ZWxlbWVudH0gc3ZnYClcclxuXHJcblx0XHQvKlxyXG5cdFx0PT09IFN0YXJ0IHNvdXJjZSA9PT1cclxuXHRcdEJhciBjaGFydCB4IHNjYWxlLCB5IHNjYWxlLCB4IGF4aXMgYW5kIHkgYXhpc1xyXG5cdFx0RnJvbSBhbiBleGFtcGxlIGJ5IE1pa2UgQm9zdG9ja1xyXG5cdFx0dmlhIGh0dHBzOi8vYmV0YS5vYnNlcnZhYmxlaHEuY29tL0BtYm9zdG9jay9kMy1iYXItY2hhcnRcclxuXHRcdFNtYWxsIGVkaXRzIGJ5IG1lIHRvIHdvcmsgd2l0aCBteSB2aXN1YWxpc2F0aW9uXHJcblx0XHQqL1xyXG5cdFx0Y29uc3QgeCA9IGQzXHJcblx0XHRcdC5zY2FsZUJhbmQoKVxyXG5cdFx0XHQuZG9tYWluKGRhdGEubWFwKGQgPT4gZC50aXRsZSkpXHJcblx0XHRcdC5yYW5nZShbdGhpcy5tYXJnaW4ubGVmdCwgdGhpcy53aWR0aCgpIC0gdGhpcy5tYXJnaW4ucmlnaHRdKVxyXG5cdFx0XHQucGFkZGluZygwLjEpXHJcblxyXG5cdFx0Y29uc3QgeSA9IGQzXHJcblx0XHRcdC5zY2FsZUxpbmVhcigpXHJcblx0XHRcdC5kb21haW4oWzAsIGQzLm1heChkYXRhLCBkID0+IGQudG90YWwpXSlcclxuXHRcdFx0Lm5pY2UoKVxyXG5cdFx0XHQucmFuZ2UoW3RoaXMuaGVpZ2h0KCkgLSB0aGlzLm1hcmdpbi5ib3R0b20sIHRoaXMubWFyZ2luLnRvcF0pXHJcblxyXG5cdFx0Y29uc3QgeEF4aXMgPSBnID0+XHJcblx0XHRcdGdcclxuXHRcdFx0XHQuYXR0cigndHJhbnNmb3JtJywgYHRyYW5zbGF0ZSgwLCR7dGhpcy5oZWlnaHQoKSAtIHRoaXMubWFyZ2luLmJvdHRvbX0pYClcclxuXHRcdFx0XHQuY2FsbChkMy5heGlzQm90dG9tKHgpLnRpY2tTaXplT3V0ZXIoMCkpXHJcblx0XHRcdFx0LnNlbGVjdEFsbCgndGV4dCcpXHJcblx0XHRcdFx0LmF0dHIoJ3knLCAwKVxyXG5cdFx0XHRcdC5hdHRyKCd4JywgMTApXHJcblx0XHRcdFx0LmF0dHIoJ2R5JywgJy4zNWVtJylcclxuXHRcdFx0XHQuYXR0cigndHJhbnNmb3JtJywgJ3JvdGF0ZSg5MCknKVxyXG5cdFx0XHRcdC5zdHlsZSgndGV4dC1hbmNob3InLCAnc3RhcnQnKVxyXG5cclxuXHRcdGNvbnN0IHlBeGlzID0gZyA9PlxyXG5cdFx0XHRnXHJcblx0XHRcdFx0LmF0dHIoJ3RyYW5zZm9ybScsIGB0cmFuc2xhdGUoJHt0aGlzLm1hcmdpbi5sZWZ0fSwwKWApXHJcblx0XHRcdFx0LmNhbGwoZDMuYXhpc0xlZnQoeSkpXHJcblx0XHRcdFx0LmNhbGwoZyA9PiBnLnNlbGVjdCgnLmRvbWFpbicpLnJlbW92ZSgpKVxyXG5cclxuXHRcdHN2Zy5zZWxlY3QoJy54QXhpcycpLmNhbGwoeEF4aXMpXHJcblxyXG5cdFx0c3ZnLnNlbGVjdCgnLnlBeGlzJykuY2FsbCh5QXhpcylcclxuXHRcdC8qID09PSBFbmQgc291cmNlID09PSAqL1xyXG5cclxuXHRcdGNvbnN0IGNoYXJ0ID0gZDMuc2VsZWN0KGAjJHtlbGVtZW50fSAucGFyZW50YClcclxuXHJcblx0XHRjb25zdCByZWN0ID0gY2hhcnQuc2VsZWN0QWxsKCdyZWN0JykuZGF0YShkYXRhKVxyXG5cclxuXHRcdHJlY3RcclxuXHRcdFx0LmVudGVyKCkuYXBwZW5kKCdyZWN0JylcclxuXHRcdFx0XHQuYXR0cigndGl0bGUnLCAoZCwgaSkgPT4gZC50aXRsZSlcclxuXHRcdFx0XHQub24oJ21vdXNlb3ZlcicsIGQgPT5cclxuXHRcdFx0XHRcdHRvb2x0aXAuc2hvdyhlbGVtZW50LCBgJHtkLnRpdGxlfTogJHtkLnRvdGFsfSBib29rc2ApXHJcblx0XHRcdFx0KVxyXG5cdFx0XHRcdC5vbignbW91c2VvdXQnLCAoKSA9PiB0b29sdGlwLmhpZGUoZWxlbWVudCkpXHJcblx0XHRcdFx0LyogbWVyZ2UgZnVuY3Rpb24gbGVhcm5lZCBmcm9tIHRoaXMgZ3JlYXQgdmlkZW8gYnkgQ3VycmFuIEtlbGxlaGVyOiBodHRwczovL3d3dy55b3V0dWJlLmNvbS93YXRjaD92PUl5SUFSNjVHLUdRICovXHJcblx0XHRcdC5tZXJnZShyZWN0KVxyXG5cdFx0XHRcdC5hdHRyKCd3aWR0aCcsIHguYmFuZHdpZHRoKCkpXHJcblx0XHRcdFx0LmF0dHIoJ2hlaWdodCcsIDApXHJcblx0XHRcdFx0LmF0dHIoJ3gnLCBkID0+IHgoZC50aXRsZSkpXHJcblx0XHRcdFx0LmF0dHIoJ3knLCBkID0+IHRoaXMuaGVpZ2h0KCkgLSB0aGlzLm1hcmdpbi5ib3R0b20pXHJcblx0XHRcdFx0LnN0eWxlKCdmaWxsJywgKGQsIGkpID0+IGNvbG9yKGkpKVxyXG5cdFx0XHRcdC50cmFuc2l0aW9uKClcclxuXHRcdFx0XHQuZHVyYXRpb24oNTAwKVxyXG5cdFx0XHRcdC5kZWxheSgoZCwgaSwgYWxsKSA9PiBpICogKE1hdGgucm91bmQoMTAwIC8gYWxsLmxlbmd0aCkgKyAxKSlcclxuXHRcdFx0XHQuYXR0cigneScsIGQgPT4geShkLnRvdGFsKSlcclxuXHRcdFx0XHQuYXR0cignaGVpZ2h0JywgZCA9PiB5KDApIC0geShkLnRvdGFsKSlcclxuXHJcblx0XHRyZWN0XHJcblx0XHRcdC5leGl0KClcclxuXHRcdFx0LnRyYW5zaXRpb24oKVxyXG5cdFx0XHQuZHVyYXRpb24oNTAwKVxyXG5cdFx0XHQuYXR0cignaGVpZ2h0JywgMClcclxuXHRcdFx0LmF0dHIoJ3knLCBkID0+IHRoaXMuaGVpZ2h0KCkgLSB0aGlzLm1hcmdpbi5ib3R0b20pXHJcblx0XHRcdC5yZW1vdmUoKVxyXG5cdH0sXHJcblxyXG5cdGhlaWdodCgpIHtcclxuXHRcdHJldHVybiB0aGlzLndpZHRoKCkgLyAyID4gd2luZG93LmlubmVySGVpZ2h0IC0gMTAgKiAxNlxyXG5cdFx0XHQ/IHdpbmRvdy5pbm5lckhlaWdodCAtIDEwICogMTZcclxuXHRcdFx0OiB0aGlzLndpZHRoKCkgLyAyXHJcblx0fSxcclxuXHJcblx0d2lkdGgoKSB7XHJcblx0XHRyZXR1cm4gc3RhdGUuZnVsbHNjcmVlblxyXG5cdFx0XHQ/IHdpbmRvdy5pbm5lcldpZHRoIC0gNiAqIDE2XHJcblx0XHRcdDogd2luZG93LmlubmVyV2lkdGggLyAxLjc1IC8vICgyMCAtIDMpICogMTZcclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gYmFyXHJcbiIsIi8qIGdsb2JhbCBkMyBtYXBib3hnbCAqL1xyXG5jb25zdCBjaXR5ID0gcmVxdWlyZSgnLi9zaG93Y2l0eS5qcycpXHJcbmNvbnN0IHRvb2x0aXAgPSByZXF1aXJlKCcuL3Rvb2x0aXAuanMnKVxyXG5cclxuY29uc3QgbWFwID0ge1xyXG5cdGNvbmZpZ3VyZShtYXBib3gpIHtcclxuXHRcdHRoaXMubWFwYm94ID0gbWFwYm94XHJcblx0XHRjaXR5LmNvbmZpZ3VyZShtYXBib3gpXHJcblx0fSxcclxuXHRjcmVhdGUoZGF0YSwgbWFwYm94KSB7XHJcblx0XHRjb25zdCBtYXBQb2ludENvbG9yID0gJyNCQkU0QTAnXHJcblxyXG5cdFx0LypcclxuXHRcdD09PSBTdGFydCBzb3VyY2UgPT09XHJcblx0XHRHZXQgTWFwYm94IG1hcCBjYW52YXMgY29udGFpbmVyXHJcblx0XHRGcm9tIGFuIGV4YW1wbGUgYnkgam9yZGl0b3N0XHJcblx0XHR2aWEgaHR0cHM6Ly9naXRodWIuY29tL2pvcmRpdG9zdC9tYXBib3hnbC1kMy1wbGF5Z3JvdW5kXHJcblx0XHQqL1xyXG5cdFx0Y29uc3QgY2hhcnQgPSBkMy5zZWxlY3QodGhpcy5tYXBib3guZ2V0Q2FudmFzQ29udGFpbmVyKCkpXHJcblx0XHQvKiA9PT0gRW5kIHNvdXJjZSA9PT0gKi9cclxuXHJcblx0XHRjaGFydFxyXG5cdFx0XHQuYXBwZW5kKCdkaXYnKVxyXG5cdFx0XHQuY2xhc3NlZCgndG9vbHRpcCcsIHRydWUpXHJcblx0XHRcdC5zdHlsZSgnb3BhY2l0eScsIDApXHJcblx0XHRcdC5hcHBlbmQoJ2g0JylcclxuXHJcblx0XHRjb25zdCBzdmcgPSBjaGFydC5hcHBlbmQoJ3N2ZycpXHJcblxyXG5cdFx0c3ZnXHJcblx0XHRcdC5hcHBlbmQoJ2cnKVxyXG5cdFx0XHQuYXR0cignZmlsbCcsIG1hcFBvaW50Q29sb3IpXHJcblx0XHRcdC5hdHRyKCdzdHJva2UnLCBtYXBQb2ludENvbG9yKVxyXG5cclxuXHRcdHRoaXMudXBkYXRlKCdtYXAnLCBkYXRhKVxyXG5cclxuXHRcdHRoaXMubW92ZSgnbWFwJylcclxuXHJcblx0XHQvKlxyXG5cdFx0PT09IFN0YXJ0IHNvdXJjZSA9PT1cclxuXHRcdFVwZGF0ZSBvbiBtYXAgaW50ZXJhY3Rpb25cclxuXHRcdEZyb20gYW4gZXhhbXBsZSBieSBqb3JkaXRvc3RcclxuXHRcdHZpYSBodHRwczovL2dpdGh1Yi5jb20vam9yZGl0b3N0L21hcGJveGdsLWQzLXBsYXlncm91bmRcclxuXHRcdCovXHJcblx0XHR0aGlzLm1hcGJveC5vbigndmlld3Jlc2V0JywgKCkgPT4gdGhpcy5tb3ZlKCdtYXAnKSlcclxuXHRcdHRoaXMubWFwYm94Lm9uKCdtb3ZlJywgKCkgPT4gdGhpcy5tb3ZlKCdtYXAnKSlcclxuXHRcdHRoaXMubWFwYm94Lm9uKCdtb3ZlZW5kJywgKCkgPT4gdGhpcy5tb3ZlKCdtYXAnKSlcclxuXHRcdHRoaXMubWFwYm94Lm9uKCd6b29tJywgKCkgPT4gdGhpcy5tb3ZlKCdtYXAnKSlcclxuXHRcdC8qID09PSBFbmQgc291cmNlID09PSAqL1xyXG5cdH0sXHJcblxyXG5cdC8qXHJcblx0PT09IFN0YXJ0IHNvdXJjZSA9PT1cclxuXHRNb3ZlIGZ1bmN0aW9uIHRvIHVwZGF0ZSBtYXAgY29vcmRpbmF0ZXMgZm9yIG1hcCBwb2ludHNcclxuXHRGcm9tIGFuIGV4YW1wbGUgYnkgam9yZGl0b3N0XHJcblx0dmlhIGh0dHBzOi8vZ2l0aHViLmNvbS9qb3JkaXRvc3QvbWFwYm94Z2wtZDMtcGxheWdyb3VuZFxyXG5cdCovXHJcblx0bW92ZShlbGVtZW50KSB7XHJcblx0XHRkMy5zZWxlY3QoYCMke2VsZW1lbnR9IGdgKVxyXG5cdFx0XHQuc2VsZWN0QWxsKCdjaXJjbGUnKVxyXG5cdFx0XHQudHJhbnNpdGlvbigpXHJcblx0XHRcdC5kdXJhdGlvbigwKVxyXG5cdFx0XHQuYXR0cignY3gnLCBkID0+IHRoaXMucHJvamVjdChkLmNvb3JkcykueClcclxuXHRcdFx0LmF0dHIoJ2N5JywgZCA9PiB0aGlzLnByb2plY3QoZC5jb29yZHMpLnkpXHJcblx0XHRcdC5hdHRyKCdyJywgZCA9PiB0aGlzLnJhZGl1cyhkLnRvdGFsKSlcclxuXHR9LFxyXG5cdC8qID09PSBFbmQgc291cmNlID09PSAqL1xyXG5cclxuXHR1cGRhdGUoZWxlbWVudCwgZGF0YSkge1xyXG5cdFx0Y29uc3QgZHVyYXRpb24gPSA1MDBcclxuXHJcblx0XHRjb25zdCBjaGFydCA9IGQzLnNlbGVjdChgIyR7ZWxlbWVudH0gc3ZnIGdgKVxyXG5cclxuXHRcdGNvbnN0IGNpcmNsZXMgPSBjaGFydC5zZWxlY3RBbGwoJ2NpcmNsZScpLmRhdGEoZGF0YSwgZCA9PiBkLmtleSlcclxuXHJcblx0XHRjaXJjbGVzXHJcblx0XHRcdC5lbnRlcigpLmFwcGVuZCgnY2lyY2xlJylcclxuXHRcdFx0XHQub24oJ21vdXNlb3ZlcicsIGQgPT4gdG9vbHRpcC5zaG93KGVsZW1lbnQsIGAke2Qua2V5fTogJHtkLnRvdGFsfSBib29rc2ApKVxyXG5cdFx0XHRcdC5vbignbW91c2VvdXQnLCAoKSA9PiB0b29sdGlwLmhpZGUoZWxlbWVudCkpXHJcblx0XHRcdFx0Lm9uKCdjbGljaycsIChkLCBpLCBhbGwpID0+IHtcclxuXHRcdFx0XHRcdHRvb2x0aXAuaGlkZShlbGVtZW50KVxyXG5cdFx0XHRcdFx0Y2l0eS5zaG93KGQsIGksIGFsbClcclxuXHRcdFx0XHR9KVxyXG5cdFx0XHRcdC5hdHRyKCdyJywgMClcclxuXHRcdFx0XHQuYXR0cignY3gnLCBkID0+IHRoaXMucHJvamVjdChkLmNvb3JkcykueClcclxuXHRcdFx0XHQuYXR0cignY3knLCBkID0+IHRoaXMucHJvamVjdChkLmNvb3JkcykueSlcclxuXHRcdFx0XHQuc3R5bGUoJ29wYWNpdHknLCAwLjUpXHJcblx0XHRcdFx0LyogbWVyZ2UgZnVuY3Rpb24gbGVhcm5lZCBmcm9tIHRoaXMgZ3JlYXQgdmlkZW8gYnkgQ3VycmFuIEtlbGxlaGVyOiBodHRwczovL3d3dy55b3V0dWJlLmNvbS93YXRjaD92PUl5SUFSNjVHLUdRICovXHJcblx0XHRcdC5tZXJnZShjaXJjbGVzKVxyXG5cdFx0XHRcdC50cmFuc2l0aW9uKClcclxuXHRcdFx0XHQuZHVyYXRpb24oZHVyYXRpb24pXHJcblx0XHRcdFx0LmF0dHIoJ3InLCBkID0+IHRoaXMucmFkaXVzKGQudG90YWwpKVxyXG5cclxuXHRcdGNpcmNsZXNcclxuXHRcdFx0LmV4aXQoKVxyXG5cdFx0XHRcdC50cmFuc2l0aW9uKClcclxuXHRcdFx0XHQuZHVyYXRpb24oZHVyYXRpb24pXHJcblx0XHRcdFx0LmF0dHIoJ3InLCAwKVxyXG5cdFx0XHRcdC5yZW1vdmUoKVxyXG5cdH0sXHJcblxyXG5cdC8qXHJcblx0PT09IFN0YXJ0IHNvdXJjZSA9PT1cclxuXHRQcm9qZWN0aW9uIGZ1bmN0aW9uIHRvIHByb2plY3QgcG9pbnRzIG9uIHRoZSBtYXAgYmFzZWQgb24gdGhlIGN1cnJlbnQgc2Nyb2xsIG9yIG1vdmUgc3RhdGVcclxuXHRGcm9tIGFuIGV4YW1wbGUgYnkgam9yZGl0b3N0XHJcblx0dmlhIGh0dHBzOi8vZ2l0aHViLmNvbS9qb3JkaXRvc3QvbWFwYm94Z2wtZDMtcGxheWdyb3VuZFxyXG5cdCovXHJcblx0cHJvamVjdChjb29yZHMpIHtcclxuXHRcdHJldHVybiB0aGlzLm1hcGJveC5wcm9qZWN0KG5ldyBtYXBib3hnbC5MbmdMYXQoK2Nvb3Jkc1swXSwgK2Nvb3Jkc1sxXSkpXHJcblx0fSxcclxuXHQvKiA9PT0gRW5kIHNvdXJjZSA9PT0gKi9cclxuXHJcblx0cmFkaXVzKGFtb3VudCkge1xyXG5cdFx0Y29uc3Qgc3RhcnRab29tID0gNlxyXG5cdFx0Y29uc3QgbWluUG9pbnRTaXplID0gMTVcclxuXHRcdGNvbnN0IHJhZGl1c0V4cCA9ICh0aGlzLm1hcGJveC5nZXRab29tKCkgLSBzdGFydFpvb20pICogMC43NSArIDFcclxuXHRcdHJldHVybiBhbW91bnQgKiByYWRpdXNFeHAgKyBtaW5Qb2ludFNpemUgPiBtaW5Qb2ludFNpemVcclxuXHRcdFx0PyBNYXRoLnNxcnQoYW1vdW50ICogcmFkaXVzRXhwICsgbWluUG9pbnRTaXplKVxyXG5cdFx0XHQ6IE1hdGguc3FydChtaW5Qb2ludFNpemUpXHJcblx0XHQvKlxyXG5cdFx0TWF0aC5zcXJ0IGJhc2VkIG9uIGV4YW1wbGUgYnkgZ29vZ2xlIHdoaWNoIHRoZXkgdXNlIGluIGRyYXdpbmcgbW9yZSB0cnVlLXRvLWxpZmUgbWFwIHBvaW50cyAtPiBodHRwczovL2RldmVsb3BlcnMuZ29vZ2xlLmNvbS9tYXBzL2RvY3VtZW50YXRpb24vamF2YXNjcmlwdC9leGFtcGxlcy9jaXJjbGUtc2ltcGxlXHJcblx0XHQqL1xyXG5cdH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBtYXBcclxuIiwiLyogZ2xvYmFsIGQzICovXHJcbmNvbnN0IHRvb2x0aXAgPSByZXF1aXJlKCcuL3Rvb2x0aXAuanMnKVxyXG5jb25zdCBoZWxwZXIgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2hlbHBlci5qcycpXHJcblxyXG5jb25zdCBwaWUgPSB7XHJcblx0ZHJhdyhlbGVtZW50LCBkYXRhKSB7XHJcblx0XHRjb25zdCBoZWlnaHQgPSB0aGlzLndpZHRoKClcclxuXHRcdGNvbnN0IHdpZHRoID0gdGhpcy53aWR0aCgpXHJcblxyXG5cdFx0Y29uc3QgY2hhcnQgPSBkMy5zZWxlY3QoYCMke2VsZW1lbnR9YClcclxuXHJcblx0XHRjaGFydFxyXG5cdFx0XHQuYXBwZW5kKCdkaXYnKVxyXG5cdFx0XHQuY2xhc3NlZCgndG9vbHRpcCcsIHRydWUpXHJcblx0XHRcdC5zdHlsZSgnb3BhY2l0eScsIDApXHJcblx0XHRcdC5hcHBlbmQoJ2g0JylcclxuXHJcblx0XHRjaGFydFxyXG5cdFx0XHQuYXBwZW5kKCdzdmcnKVxyXG5cdFx0XHQuYXR0cignd2lkdGgnLCB3aWR0aClcclxuXHRcdFx0LmF0dHIoJ2hlaWdodCcsIGhlaWdodClcclxuXHRcdFx0LmFwcGVuZCgnZycpXHJcblx0XHRcdC5jbGFzc2VkKCdwYXJlbnQnLCB0cnVlKVxyXG5cdFx0XHQuYXR0cigndHJhbnNmb3JtJywgYHRyYW5zbGF0ZSgke3dpZHRoIC8gMn0sICR7aGVpZ2h0IC8gMn0pYClcclxuXHJcblx0XHR0aGlzLnVwZGF0ZShlbGVtZW50LCBkYXRhKVxyXG5cdH0sXHJcblxyXG5cdHVwZGF0ZShlbGVtZW50LCBkYXRhKSB7XHJcblx0XHRjb25zdCBjb2xvciA9IGhlbHBlci5jb2xvcihkYXRhKVxyXG5cclxuXHRcdGNvbnN0IHJhZGl1cyA9IHRoaXMud2lkdGgoKSAvIDJcclxuXHJcblx0XHQvKlxyXG5cdFx0PT09IFN0YXJ0IHNvdXJjZSA9PT1cclxuXHRcdGFyYyBhbmQgcGllIGZ1bmN0aW9ucyB0byBjb3JyZWN0bHkgY29uZmlndXJlIHBpZSBjaGFydHNcclxuXHRcdEZyb20gYW4gZXhhbXBsZSBieSBDaHVjayBHcmltbWV0dFxyXG5cdFx0dmlhIGh0dHA6Ly93d3cuY2FncmltbWV0dC5jb20vdGlsLzIwMTYvMDgvMTkvZDMtcGllLWNoYXJ0Lmh0bWxcclxuXHRcdCovXHJcblx0XHRjb25zdCBhcmMgPSBkM1xyXG5cdFx0XHQuYXJjKClcclxuXHRcdFx0Lm91dGVyUmFkaXVzKHJhZGl1cylcclxuXHRcdFx0LmlubmVyUmFkaXVzKDApXHJcblxyXG5cdFx0Y29uc3QgcGllID0gZDNcclxuXHRcdFx0LnBpZSgpXHJcblx0XHRcdC5zb3J0KG51bGwpXHJcblx0XHRcdC52YWx1ZShkID0+IGQudG90YWwpXHJcblx0XHQvKiA9PT0gRW5kIHNvdXJjZSA9PT0gKi9cclxuXHJcblx0XHRjb25zdCBjaGFydCA9IGQzLnNlbGVjdChgIyR7ZWxlbWVudH0gLnBhcmVudGApXHJcblxyXG5cdFx0Y29uc3QgcGF0aCA9IGNoYXJ0LnNlbGVjdEFsbCgncGF0aCcpLmRhdGEocGllKGRhdGEpLCAoZCwgaSkgPT4gJ3BhdGgnICsgaSlcclxuXHJcblx0XHRwYXRoXHJcblx0XHRcdC5lbnRlcigpXHJcblx0XHRcdC5hcHBlbmQoJ3BhdGgnKVxyXG5cdFx0XHQuYXR0cigndGl0bGUnLCAoZCwgaSkgPT4gZC5kYXRhLnRpdGxlKVxyXG5cdFx0XHQub24oJ21vdXNlb3ZlcicsIGQgPT5cclxuXHRcdFx0XHR0b29sdGlwLnNob3coZWxlbWVudCwgYCR7ZC5kYXRhLnRpdGxlfTogJHtkLnZhbHVlfSBib29rc2ApXHJcblx0XHRcdClcclxuXHRcdFx0Lm9uKCdtb3VzZW91dCcsICgpID0+IHRvb2x0aXAuaGlkZShlbGVtZW50KSlcclxuXHRcdFx0LnN0eWxlKCdmaWxsJywgKGQsIGkpID0+IGNvbG9yKGkpKVxyXG5cdFx0XHQvKiBTYXZlcyBpbml0aWFsIGFyYyB2YWx1ZSwgYnkgZXhhbXBsZSBmcm9tIE1pa2UgQm9zdG9jayAoaHR0cHM6Ly9ibC5vY2tzLm9yZy9tYm9zdG9jay8xMzQ2NDEwKSAqL1xyXG5cdFx0XHQuZWFjaCgoZCwgaSwgYWxsKSA9PiAoYWxsW2ldLl9jdXJyZW50ID0gZCkpXHJcblx0XHRcdC50cmFuc2l0aW9uKClcclxuXHRcdFx0LmR1cmF0aW9uKDUwMClcclxuXHRcdFx0LmF0dHJUd2VlbignZCcsIGVudGVyVHdlZW4pXHJcblxyXG5cdFx0cGF0aFxyXG5cdFx0XHQudHJhbnNpdGlvbigpXHJcblx0XHRcdC5zdHlsZSgnZmlsbCcsIChkLCBpKSA9PiBjb2xvcihpKSlcclxuXHRcdFx0LmR1cmF0aW9uKDUwMClcclxuXHRcdFx0LmF0dHJUd2VlbignZCcsIGFyY1R3ZWVuKVxyXG5cclxuXHRcdHBhdGguZXhpdCgpLnJlbW92ZSgpXHJcblxyXG5cdFx0Ly8gc2FtZSBhcyBuZXh0IGZ1bmN0aW9uIGJ1dCBzdGlsbCBkb24ndCBrbm93IGhvdyB0byB3b3JrIHdpdGggbmV4dCBmdW5jdGlvbiB0byBnbyBmcm9tIDAgb24gZW50ZXJcclxuXHRcdGZ1bmN0aW9uIGVudGVyVHdlZW4oZCkge1xyXG5cdFx0XHRkLmlubmVyUmFkaXVzID0gMFxyXG5cdFx0XHR2YXIgaSA9IGQzLmludGVycG9sYXRlKHsgc3RhcnRBbmdsZTogMCwgZW5kQW5nbGU6IDAgfSwgZClcclxuXHRcdFx0cmV0dXJuIHQgPT4gYXJjKGkodCkpXHJcblx0XHR9XHJcblx0XHQvKlxyXG5cdFx0PT09IFN0YXJ0IHNvdXJjZSA9PT1cclxuXHRcdEludGVycG9sYXRlIGJldHdlZW4gcHJldmlvdXMgZW5kcG9pbnQgb2YgZGF0YXBvaW50IGFyYyBhbmQgbmV3IGVuZHBvaW50XHJcblx0XHRGcm9tIGFuIGV4YW1wbGUgYnkgTWlrZSBCb3N0b2NrXHJcblx0XHR2aWEgaHR0cHM6Ly9ibC5vY2tzLm9yZy9tYm9zdG9jay8xMzQ2NDEwXHJcblx0XHQqL1xyXG5cdFx0ZnVuY3Rpb24gYXJjVHdlZW4oZCkge1xyXG5cdFx0XHRjb25zdCBpID0gZDMuaW50ZXJwb2xhdGUodGhpcy5fY3VycmVudCwgZClcclxuXHRcdFx0dGhpcy5fY3VycmVudCA9IGkoMClcclxuXHRcdFx0cmV0dXJuIHQgPT4gYXJjKGkodCkpXHJcblx0XHR9XHJcblx0XHQvKiA9PT0gRW5kIHNvdXJjZSA9PT0gKi9cclxuXHR9LFxyXG5cclxuXHQvKiBNYWtlcyBzdXJlIHRoZSBwaWUgY2hhcnRzICh3aGljaCBhcmUgcmVuZGVyZWQgbmV4dCB0byBlYWNob3RoZXIpIGRvbid0IGV4Y2VlZCB0aGVpciBjb250YWluZXIgbGltaXQuXHJcblx0IE9uIG1vYmlsZSBtYWtlcyBzdXJlIHRoZSBjaGFydHMgYXJlIGhhbGYgb2YgdGhlIHZpZXdwb3J0IHdpdGggYSBsZWZ0b3ZlciBzcGFjZSBvZiA1MCBlYWNoICovXHJcblx0d2lkdGgoKSB7XHJcblx0XHRyZXR1cm4gd2luZG93LmlubmVyV2lkdGggLSAxMDAgPiA0MCAqIDE2XHJcblx0XHRcdD8gMjAwXHJcblx0XHRcdDogKHdpbmRvdy5pbm5lcldpZHRoIC0gMTAwKSAvIDJcclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gcGllXHJcbiIsIi8qIGdsb2JhbCBkMyAqL1xyXG5jb25zdCBzdGF0ZSA9IHJlcXVpcmUoJy4uL3N0YXRlLmpzJylcclxuXHJcbmNvbnN0IGNpdHkgPSB7XHJcblx0Y29uZmlndXJlKG1hcGJveCkge1xyXG5cdFx0dGhpcy5tYXBib3ggPSBtYXBib3hcclxuXHR9LFxyXG5cdHNob3coY2l0eSwgaW5kZXgsIGFsbCkge1xyXG5cdFx0c3RhdGUuc2V0KCdjaXR5Jywge1xyXG5cdFx0XHRuYW1lOiBjaXR5LmtleSxcclxuXHRcdFx0YW1vdW50OiBjaXR5LnRvdGFsLFxyXG5cdFx0XHRwdWJsaXNoZXJzOiBjaXR5LnZhbHVlc1xyXG5cdFx0XHRcdC5tYXAocHVibGlzaGVyID0+ICh7XHJcblx0XHRcdFx0XHR0aXRsZTogcHVibGlzaGVyLmtleSxcclxuXHRcdFx0XHRcdHRvdGFsOiBwdWJsaXNoZXIudmFsdWVzLmxlbmd0aFxyXG5cdFx0XHRcdH0pKVxyXG5cdFx0XHRcdC5zb3J0KChhLCBiKSA9PiBhLnRvdGFsIC0gYi50b3RhbClcclxuXHRcdH0pXHJcblxyXG5cdFx0c3RhdGUuY2l0eS5wdWJsaXNoZXJzLmxlbmd0aCA8PSAxID8gc3RhdGUuc2V0KCdzaG93YmFyJywgZmFsc2UpIDogZmFsc2VcclxuXHJcblx0XHQvKiBNYWtlIHRoZSBjbGlja2VkIGNpcmNsZSBmdWxsIGNvbG9yICovXHJcblx0XHRkMy5zZWxlY3RBbGwoJ2NpcmNsZScpLnN0eWxlKCdvcGFjaXR5JywgMC41KVxyXG5cdFx0ZDMuc2VsZWN0KGFsbFtpbmRleF0pLnN0eWxlKCdvcGFjaXR5JywgMSlcclxuXHJcblx0XHQvKiBPbiBtb2JpbGUsIHB1dCB0aGUgbWFwIGNlbnRlciBtb3JlIHRvIHRoZSB0b3Agb2YgdGhlIHNjcmVlbiB0byBhY2NvbW9kYXRlIGZvciB0aGUgY2l0eSBpbmZvIGRpdiAqL1xyXG5cdFx0Y29uc3QgY2VudGVyID1cclxuXHRcdFx0d2luZG93LmlubmVyV2lkdGggPiA0MCAqIDE2XHJcblx0XHRcdFx0PyBbY2l0eS5jb29yZHNbMF0sIGNpdHkuY29vcmRzWzFdXVxyXG5cdFx0XHRcdDogW2NpdHkuY29vcmRzWzBdLCBjaXR5LmNvb3Jkc1sxXSAtIDAuM11cclxuXHJcblx0XHR0aGlzLm1hcGJveC5mbHlUbyh7XHJcblx0XHRcdGNlbnRlcixcclxuXHRcdFx0c3BlZWQ6IDAuMyxcclxuXHRcdFx0Y3VydmU6IDIsXHJcblx0XHRcdHpvb206IDhcclxuXHRcdH0pXHJcblx0fVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGNpdHlcclxuIiwiLyogZ2xvYmFsIGQzICovXHJcbmNvbnN0IHRvb2x0aXAgPSB7XHJcblx0c2hvdyhlbGVtZW50LCB0ZXh0KSB7XHJcblx0XHRkMy5zZWxlY3QoYCMke2VsZW1lbnR9IC50b29sdGlwYClcclxuXHRcdFx0LnN0eWxlKFxyXG5cdFx0XHRcdCdsZWZ0JyxcclxuXHRcdFx0XHRgJHtkMy5ldmVudC5wYWdlWH1weGBcclxuXHRcdFx0KSAvKiBkMy5ldmVudCBsZWFybmVkIGZyb20gZGVubmlzd2VnZXJlZWYgKGh0dHBzOi8vZ2l0aHViLmNvbS9kZW5uaXN3ZWdlcmVlZikgKi9cclxuXHRcdFx0LnN0eWxlKFxyXG5cdFx0XHRcdCd0b3AnLFxyXG5cdFx0XHRcdGAke2QzLmV2ZW50LnBhZ2VZIC0gMzB9cHhgXHJcblx0XHRcdCkgLyogZDMuZXZlbnQgbGVhcm5lZCBmcm9tIGRlbm5pc3dlZ2VyZWVmIChodHRwczovL2dpdGh1Yi5jb20vZGVubmlzd2VnZXJlZWYpICovXHJcblx0XHRcdC50cmFuc2l0aW9uKClcclxuXHRcdFx0LmR1cmF0aW9uKDMwMClcclxuXHRcdFx0LnN0eWxlKCdvcGFjaXR5JywgMC44KVxyXG5cdFx0XHQuc2VsZWN0KCdoNCcpXHJcblx0XHRcdC50ZXh0KHRleHQpXHJcblx0fSxcclxuXHRoaWRlKGVsZW1lbnQpIHtcclxuXHRcdGQzLnNlbGVjdChgIyR7ZWxlbWVudH0gLnRvb2x0aXBgKVxyXG5cdFx0XHQudHJhbnNpdGlvbigpXHJcblx0XHRcdC5kdXJhdGlvbigzMDApXHJcblx0XHRcdC5zdHlsZSgnb3BhY2l0eScsIDApXHJcblx0fVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHRvb2x0aXBcclxuIiwiLyogZ2xvYmFsIGQzICovXHJcbmNvbnN0IHN0YXRlID0gcmVxdWlyZSgnLi4vc3RhdGUuanMnKVxyXG5jb25zdCBoZWxwZXIgPSB7XHJcblx0LypcclxuXHQ9PT0gU3RhcnQgc291cmNlID09PVxyXG5cdE1ha2UgcmFuZ2Ugb2YgY29sb3JzIHRvIHVzZSB3aGVuIHJlbmRlcmluZyBpdGVtcyBpbiBhIGJhciBjaGFydCBvciBwaWUgY2hhcnRcclxuXHRCYXNlZCBvbiBleGFtcGxlcyBieSBKZXJvbWUgQ3VraWVyIGFuZCB0aGUgZDMgZG9jdW1lbnRhdGlvblxyXG5cdHZpYSBodHRwczovL2dpdGh1Yi5jb20vZDMvZDMtc2NhbGUjY29udGludW91cy1zY2FsZXNcclxuXHR2aWEgaHR0cDovL3d3dy5qZXJvbWVjdWtpZXIubmV0LzIwMTEvMDgvMTEvZDMtc2NhbGVzLWFuZC1jb2xvci9cclxuXHQqL1xyXG5cdGNvbG9yKGRhdGEpIHtcclxuXHRcdHJldHVybiBkM1xyXG5cdFx0XHQuc2NhbGVMaW5lYXIoKVxyXG5cdFx0XHQuZG9tYWluKFswLCBNYXRoLnJvdW5kKGRhdGEubGVuZ3RoIC8gMiksIGRhdGEubGVuZ3RoXSlcclxuXHRcdFx0LnJhbmdlKFsnI0JCRTRBMCcsICcjNTJBOEFGJywgJyMwMDMwNUMnXSlcclxuXHR9LFxyXG5cdC8qID09PSBFbmQgc291cmNlID09PSAqL1xyXG5cclxuXHRncm91cENpdGllcyhkYXRhLCBjb29yZGluYXRlcykge1xyXG5cdFx0Y29uc3QgY2l0aWVzID0gZDNcclxuXHRcdFx0Lm5lc3QoKVxyXG5cdFx0XHQua2V5KGJvb2sgPT4gYm9vay5wdWJsaWNhdGlvbi5wbGFjZSlcclxuXHRcdFx0LmtleShib29rID0+IGJvb2sucHVibGljYXRpb24ucHVibGlzaGVyKVxyXG5cdFx0XHQuZW50cmllcyhkYXRhKVxyXG5cdFx0XHQubWFwKGNpdHkgPT4ge1xyXG5cdFx0XHRcdC8qIG1hdGNoIGVxdWFscyB0cnVlIGlmIGNpdHkgaXMgaW4gY29vcmRpbmF0ZXMgZGF0YWJhc2UgKi9cclxuXHRcdFx0XHRjb25zdCBtYXRjaCA9IGNvb3JkaW5hdGVzLmZpbmQoXHJcblx0XHRcdFx0XHRwbGFjZSA9PiBwbGFjZS5jaXR5LnRvTG93ZXJDYXNlKCkgPT09IGNpdHkua2V5LnRvTG93ZXJDYXNlKClcclxuXHRcdFx0XHQpXHJcblx0XHRcdFx0aWYgKCFtYXRjaCkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIG51bGxcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0Y29uc3QgdG90YWwgPSBjaXR5LnZhbHVlc1xyXG5cdFx0XHRcdFx0Lm1hcChwdWJsaXNoZXIgPT4gcHVibGlzaGVyLnZhbHVlcy5sZW5ndGgpXHJcblx0XHRcdFx0XHQucmVkdWNlKChhLCBiKSA9PiBhICsgYiwgMClcclxuXHJcblx0XHRcdFx0Y29uc3QgY29vcmRzID0gW051bWJlcihtYXRjaC5sbmcpLCBOdW1iZXIobWF0Y2gubGF0KV1cclxuXHJcblx0XHRcdFx0cmV0dXJuIHtcclxuXHRcdFx0XHRcdC4uLmNpdHksXHJcblx0XHRcdFx0XHR0b3RhbCxcclxuXHRcdFx0XHRcdGNvb3Jkc1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSlcclxuXHRcdFx0LmZpbHRlcihjaXR5ID0+IGNpdHkgIT09IG51bGwpXHJcblx0XHRyZXR1cm4gY2l0aWVzXHJcblx0fSxcclxuXHJcblx0ZmlsdGVyR2VucmUoZ2VucmUpIHtcclxuXHRcdGxldCBkYXRhXHJcblxyXG5cdFx0aWYgKGdlbnJlID09PSAnYWxsJykge1xyXG5cdFx0XHRkYXRhID0gc3RhdGUuZGF0YS50b3RhbFxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0ZGF0YSA9IHN0YXRlLmRhdGEudG90YWwuZmlsdGVyKGJvb2sgPT4gYm9vay5nZW5yZXMuaW5jbHVkZXMoZ2VucmUpKVxyXG5cdFx0fVxyXG5cclxuXHRcdGQzLnNlbGVjdEFsbCgnY2lyY2xlJylcclxuXHRcdFx0LnN0eWxlKCdvcGFjaXR5JywgJzAuNScpXHJcblxyXG5cdFx0c3RhdGUuc2V0KCdjaXR5Jywge1xyXG5cdFx0XHQuLi5zdGF0ZS5jaXR5LFxyXG5cdFx0XHRuYW1lOiAnJ1xyXG5cdFx0fSlcclxuXHRcdHN0YXRlLnNldCgnc2hvd2JhcicsIGZhbHNlKVxyXG5cdFx0c3RhdGUuc2V0KCdkYXRhJywge1xyXG5cdFx0XHQuLi5zdGF0ZS5kYXRhLFxyXG5cdFx0XHRjaXRpZXM6IHRoaXMuZ3JvdXBDaXRpZXMoZGF0YSwgc3RhdGUuZGF0YS5jb29yZGluYXRlcyksXHJcblx0XHRcdGFtb3VudDogZGF0YS5sZW5ndGhcclxuXHRcdH0pXHJcblx0fSxcclxuXHJcblx0Zm9ybWF0RGF0YShyZXN1bHRzKSB7XHJcblx0XHRjb25zdCBjb29yZGluYXRlcyA9IHJlc3VsdHNbMF0uY29uY2F0KHJlc3VsdHNbMV0pXHJcblxyXG5cdFx0Y29uc3QgaGFzUHVibGljYXRpb24gPSByZXN1bHRzWzJdXHJcblx0XHRcdC5maWx0ZXIoYm9vayA9PiBib29rLnB1YmxpY2F0aW9uLnBsYWNlICYmIGJvb2sucHVibGljYXRpb24ucHVibGlzaGVyKVxyXG5cdFx0XHQubWFwKGJvb2sgPT4ge1xyXG5cdFx0XHRcdC8qIE1ha2Ugc3VyZSByYW5kb20gY2hhcmFjdGVycyBhcmUgcmVtb3ZlZCBmcm9tIHRoZSBwdWJsaWNhdGlvbiBjaXR5IG5hbWUgKi9cclxuXHRcdFx0XHRib29rLnB1YmxpY2F0aW9uLnBsYWNlID0gYm9vay5wdWJsaWNhdGlvbi5wbGFjZVxyXG5cdFx0XHRcdFx0LnJlcGxhY2UoL1teYS16QS1aLFxcc10rL2csICcnKVxyXG5cdFx0XHRcdFx0LnRyaW0oKVxyXG5cdFx0XHRcdFx0LnNwbGl0KCcsJylbMF1cclxuXHRcdFx0XHQvKiBNYWtlIHN1cmUgaW5jb25zaXN0ZW5jaWVzIGluIG5hbWluZyBvZiBwdWJsaXNoZXJzIGdldCBncm91cGVkIHRvZ2V0aGVyICovXHJcblx0XHRcdFx0Ym9vay5wdWJsaWNhdGlvbi5wdWJsaXNoZXIgPSBib29rLnB1YmxpY2F0aW9uLnB1Ymxpc2hlclxyXG5cdFx0XHRcdFx0LnJlcGxhY2UoL1teYS16QS1aLFxcc10rL2csICcnKVxyXG5cdFx0XHRcdFx0LnJlcGxhY2UoJ1VpdGdldmVyaWonLCAnJylcclxuXHRcdFx0XHRcdC5yZXBsYWNlKCd1aXRnZXZlcmlqJywgJycpXHJcblx0XHRcdFx0XHQudHJpbSgpXHJcblx0XHRcdFx0XHQuc3BsaXQoJywnKVswXVxyXG5cdFx0XHRcdFx0LnRvTG93ZXJDYXNlKClcclxuXHRcdFx0XHRcdC8qXHJcblx0XHRcdFx0XHQ9PT0gU3RhcnQgc291cmNlID09PVxyXG5cdFx0XHRcdFx0Q2FwaXRhbGl6ZSBmaXJzdCBsZXR0ZXIgaW4gYSBzdHJpbmdcclxuXHRcdFx0XHRcdGZyb20gYW4gZXhhbXBsZSBieSBKb3NoIFRyb25pY1xyXG5cdFx0XHRcdFx0dmlhIGh0dHBzOi8vam9zaHRyb25pYy5jb20vMjAxNi8wMi8xNC9ob3ctdG8tY2FwaXRhbGl6ZS10aGUtZmlyc3QtbGV0dGVyLWluLWEtc3RyaW5nLWluLWphdmFzY3JpcHQvXHJcblx0XHRcdFx0XHQqL1xyXG5cdFx0XHRcdFx0LnJlcGxhY2UoL15cXHcvLCBjID0+IGMudG9VcHBlckNhc2UoKSlcclxuXHRcdFx0XHQvKiA9PT0gRW5kIHNvdXJjZSA9PT0gKi9cclxuXHRcdFx0XHRyZXR1cm4gYm9va1xyXG5cdFx0XHR9KVxyXG5cclxuXHRcdGNvbnN0IGdlbnJlcyA9IGhhc1B1YmxpY2F0aW9uXHJcblx0XHRcdC5tYXAoYm9vayA9PiBib29rLmdlbnJlcylcclxuXHRcdFx0LnJlZHVjZSgodG90YWwsIGJvb2tHZW5yZXMpID0+IHRvdGFsLmNvbmNhdChib29rR2VucmVzKSwgW10pXHJcblx0XHRcdC5zb3J0KClcclxuXHJcblx0XHRjb25zdCBjaXRpZXMgPSB0aGlzLmdyb3VwQ2l0aWVzKGhhc1B1YmxpY2F0aW9uLCBjb29yZGluYXRlcylcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdGNpdGllczogY2l0aWVzLFxyXG5cdFx0XHQvKiBIZXJlIG5ldyBTZXQgZ2VuZXJhdGVzIGFuIGFycmF5IHdpdGggb25seSB1bmlxdWUgdmFsdWVzIGZyb20gYSBkaWZmZXJlbnQgYXJyYXkgKi9cclxuXHRcdFx0Z2VucmVzOiBbLi4ubmV3IFNldChnZW5yZXMpXSxcclxuXHRcdFx0YW1vdW50OiBoYXNQdWJsaWNhdGlvbi5sZW5ndGgsXHJcblx0XHRcdHRvdGFsOiBoYXNQdWJsaWNhdGlvbixcclxuXHRcdFx0Y29vcmRpbmF0ZXM6IGNvb3JkaW5hdGVzXHJcblx0XHR9XHJcblx0fVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGhlbHBlclxyXG4iLCJjb25zdCBzdGF0ZSA9IHtcclxuXHRzZXQocHJvcGVydHksIHZhbHVlKSB7XHJcblx0XHR0aGlzW3Byb3BlcnR5XSA9IHZhbHVlXHJcblx0fSxcclxuXHRsb2FkZWQ6IGZhbHNlLFxyXG5cdGN1cnJlbnRDaXR5OiAwLFxyXG5cdHNob3diYXI6IGZhbHNlLFxyXG5cdGZ1bGxzY3JlZW46IGZhbHNlLFxyXG5cdGRhdGE6IHtcclxuXHRcdGdlbnJlczogW10sXHJcblx0XHRhbW91bnQ6IDAsXHJcblx0XHRjaXRpZXM6IFtdLFxyXG5cdFx0dG90YWw6IFtdXHJcblx0fSxcclxuXHRjaXR5OiB7XHJcblx0XHRuYW1lOiAnJyxcclxuXHRcdGFtb3VudDogMCxcclxuXHRcdHB1Ymxpc2hlcnM6IFtdXHJcblx0fVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHN0YXRlXHJcbiIsIi8qIGdsb2JhbCBkMyBWdWUgbWFwYm94Z2wgKi9cclxuY29uc3Qgc3RhdGUgPSByZXF1aXJlKCcuL3N0YXRlLmpzJylcclxuY29uc3QgbWFwID0gcmVxdWlyZSgnLi9kMy9tYXAuanMnKVxyXG5jb25zdCBwaWUgPSByZXF1aXJlKCcuL2QzL3BpZS5qcycpXHJcbmNvbnN0IGhlbHBlciA9IHJlcXVpcmUoJy4vaGVscGVycy9oZWxwZXIuanMnKVxyXG5jb25zdCBsYXlvdXQgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvdnVlLmpzJylcclxuXHJcbmxheW91dCgpXHJcblxyXG5tYXBib3hnbC5hY2Nlc3NUb2tlbiA9XHJcblx0J3BrLmV5SjFJam9pWm1wMlpIQnZiQ0lzSW1FaU9pSmphbTltY1cxaE1tVXdObTgxTTNGdk9XOXZNRE01TW01aUluMC41eFZQWWQ5M1RaUUV5cWNoRE1OQnR3J1xyXG5cclxuY29uc3QgbWFwYm94ID0gbmV3IG1hcGJveGdsLk1hcCh7XHJcblx0Y29udGFpbmVyOiAnbWFwJyxcclxuXHRzdHlsZTogJ21hcGJveDovL3N0eWxlcy9manZkcG9sL2Nqb2p3YmNtNTBka2MycnRmbzNtNHZzNmknLFxyXG5cdGNlbnRlcjogWzQuODk5NDMxLCA1Mi4zNzkxODldLFxyXG5cdHpvb206IDUsXHJcblx0cGl0Y2g6IDQwLFxyXG5cdG1pblpvb206IDJcclxufSlcclxuXHJcbm1hcGJveC5vbignbG9hZCcsICgpID0+IHtcclxuXHRQcm9taXNlLmFsbChbXHJcblx0XHRkMy5jc3YoJ2RhdGEvY29kZXNuZXRoZXJsYW5kcy5jc3YnKSxcclxuXHRcdGQzLmNzdignZGF0YS93b3JsZGNpdGllcy5jc3YnKSxcclxuXHRcdGQzLmpzb24oJ2RhdGEvZGF0YS5qc29uJylcclxuXHRdKVxyXG5cdFx0LnRoZW4ocmVzdWx0cyA9PiB7XHJcblx0XHRcdHN0YXRlLnNldCgnZGF0YScsIGhlbHBlci5mb3JtYXREYXRhKHJlc3VsdHMpKVxyXG5cclxuXHRcdFx0bWFwLmNvbmZpZ3VyZShtYXBib3gpXHJcblx0XHRcdG1hcC5jcmVhdGUoc3RhdGUuZGF0YS5jaXRpZXMpXHJcblxyXG5cdFx0XHRzdGF0ZS5zZXQoJ2xvYWRlZCcsIHRydWUpXHJcblxyXG5cdFx0XHRtYXBib3guZmx5VG8oe1xyXG5cdFx0XHRcdHpvb206IDYsXHJcblx0XHRcdFx0c3BlZWQ6IDAuNFxyXG5cdFx0XHR9KVxyXG5cdFx0fSlcclxuXHRcdC5jYXRjaChlcnIgPT4ge1xyXG5cdFx0XHRjb25zb2xlLmxvZyhlcnIpXHJcblx0XHR9KVxyXG59KVxyXG4iXX0=
