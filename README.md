# Frontend data

## Summary
To make a interactive multi level datavisualisation using D3.js about entries from the OBA API.

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

# Reload data file
node server

# run static server (to prevent JSON crying about CORS)
http-server static
```

## Process
*Will be rewritten in a more readable, less tasklist like form in the near future. For now just keeping track*   

After the [previous project](https://github.com/fjvdpol/functional-programming), I had to find a new interesting way to sort the entries from the OBA API.
I've always been the most impressed by datavisualisations using maps, so I decided to use the publication location of books as my entry point.

I started with setting up this project by adding eslint and xo, because I never really worked with linters or bug-prevention scripts.

After that it was time to haul over the server and API I used in the previous project.

I want to show the total amount of books per country from all the books within a genre from the OBA API, so I started looking for a way to generate a map which was able to give me plenty of scaling options. I ended up with [mapbox](https://www.mapbox.com/), after that website was shown to me by Bert Spaan in a lecture. I customized a style for the map and loaded it into this project.

I rewrote my index.js to add Place, Publisher and Author to the book data so I will be able to plot the locations on the mapbox map.

## Links for later
* [Using mapbox and D3](https://github.com/jorditost/mapboxgl-d3-playground)
* [Shapes on maps](http://turfjs.org/)
* [Color scheme map](https://www.htmlcsscolor.com/hex/00305C)
* [connection map datavisualization principle](https://datavizcatalogue.com/methods/connection_map.html)
