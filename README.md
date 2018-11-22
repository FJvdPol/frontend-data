# Frontend data

## Summary
To make a interactive multi level datavisualisation using D3.js about entries from the OBA API.

[see the prototype](https://fjvdpol.github.io/frontend-data/static)

## Table of contents

- [Install](#install)
- [Data](#data)
- [Visualisation](#visualsation)
  - [Inspiration](#inspiration)
  - [Code](#code)
- [Conclusion](#conclusion)
- [Still to do](#to-do)
- [Credits](#credits)
- [Proces](#proces)

## Install
```bash
# clone the repo
git clone https://fjvdpol.github.com/frontend-data

# Create a .env file
touch .env

# Add public key to the .env file (obv you need to get your hands on your own public key)
echo "PUBLIC=0123456789" >> .env

# Install dependencies
npm install

# run static server (to prevent JSON crying about CORS)
http-server static
```

## Data
The data used in this process consists of a selection of ~4200 books from the OBA in a JSON file, kindly made available by [maanlamp](https://github.com/maanlamp).
Inside this project is a way to get your own set of data, but i would not recommend it since it will output in a format that can't be used by the current visualisation (it's on my to-do list...)
If you do want to generate a custom data file, just run
```bash
node server
```
in the root folder of the project.
I've chosen to use maanlamp's selection since it provided a nice big dataset with alot of different types of books.

## Visualisation




## Process
*Will be rewritten in a more readable, less tasklist like form in the near future. For now just keeping track*   

After the [previous project](https://github.com/fjvdpol/functional-programming), I had to find a new interesting way to sort the entries from the OBA API.
I've always been the most impressed by datavisualisations using maps, so I decided to use the publication location of books as my entry point.

I started with setting up this project by adding eslint and xo, because I never really worked with linters or bug-prevention scripts.

After that it was time to haul over the server and API I used in the previous project.

I want to show the total amount of books per country from all the books within a genre from the OBA API, so I started looking for a way to generate a map which was able to give me plenty of scaling options. I ended up with [mapbox](https://www.mapbox.com/), after that website was shown to me by Bert Spaan in a lecture. I customized a style for the map and loaded it into this project.

I rewrote my index.js to add Place, Publisher and Author to the book data so I will be able to plot the locations on the mapbox map.

After a bit of brainstorming and talking to laurens I settled on making a datavisualisation which first plots the countries where books are published. Once clicked on a country the locations of publishers are plotted on the country map. Every publisher dot will be bigger or smaller depending on the amount of books they published that are present in the OBA stock. Clicking on a publisher will show metadata about the publisher and compare the publisher in a pie chart to the rest of the publishers in that country.
Clicking on any slice of the pie chart will move the focus to that specific publisher.

### High fidelity prototype
*(these are wireframes, not the final product)*  

To further envision this concept I made a few wireframes. I intend the project to start as a relatively bare world map, where you can see where the books that are in the OBA API come from. The bigger the circle on a country, the more books/publishers (still deciding) come from that country.

![map overview europe](docs/wireframe-1.png)

---
If you click on any of the circles the map will zoom in on that specific country (you can also zoom manually). Zooming in will show more circles in specific places in that country. Every circle in a country represents a publisher in that country. The bigger the circle, the more books come from that publisher.

![map overview europe](docs/wireframe-2.png)

---
Clicking on any of the publishers will open a detail tab, which shows information about this specific publisher and shows the amount of books they provide to the OBA relative to the other publishers in that country in a pie chart. Clicking on other pieces of the pie chart will shift the focus to that represented publisher.
A list of all books from the specific publisher will also be shown.
If I have enough time I'd like to add charts that show the ratio of languages and/or genres they provide.

![map overview europe](docs/wireframe-3.png)

---
### Final concept
After presenteing my wireframes to my peers where the idea arose to cluster the publishers per city, to show one dot per city instead of one per publisher. When clicking on one of the city dots two pie charts show up. The first chart shows the ratio of the total books of that city in relation to the rest of the world and the next one shows the ratio of publishers in relation to eachother in that city.

In the end I also decided to add a bar chart for the ratio between publishers in a specific city, which sometimes helps to better show the absolute values relative to eachoter.

I left the original pie chart showing the relation between publishers in the product because it works better than a bar chart for mobile users.

## Links for later
* [Using mapbox and D3](https://github.com/jorditost/mapboxgl-d3-playground)
* [Shapes on maps](http://turfjs.org/)
* [Color scheme map](https://www.htmlcsscolor.com/hex/00305C)
* [connection map datavisualisation principle](https://datavizcatalogue.com/methods/connection_map.html)
* [locations for all countries on maps](https://developers.google.com/public-data/docs/canonical/countries_csv)
* [locations for alot of cities per country](https://simplemaps.com/data/world-cities)
* [zipcodes with lat and long coordinates of places in the netherlands](https://github.com/bobdenotter/4pp)
* [LocationIQ location API](https://locationiq.com/)
