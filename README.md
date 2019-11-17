Getting Started
---------------

* ensure [Node](http://nodejs.org) is installed
* `npm install` downloads dependencies
* `npm start` generates files within the `dist` directory
* `npm test` checks code for stylistic consistency
* `npm run format` auto-formats code
* `./bin/pkg-update` updates dependencies
  (transitive dependencies should occasionally be updated as well:
  `rm -rf node_modules package-lock.json; npm install`)
