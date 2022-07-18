# Evolution Simulator

An interactive program that demonstrates how a population can evolve over time.

* [Try it online](https://owenbechtel.com/games/evolution-simulator)
* To compile, run `npx tsc && npx browserify js/main.js -o game.js`

## Creatures

The population in each generation consists of 100 "creatures". A creature is simply a collection of particles, along with a set of rules for how those particles interact over time. Specifically, for each ordered pair _(P, Q)_ of distinct particles, there is a minimum radius _r_, a maximum radius _R_, and an attraction _a_. If the distance between _P_ and _Q_ is greater than _r_ but less than _R_, then particle _P_ will accelerate in the direction of particle _Q_ with magnitude _a_. The total acceleration of particle _P_ at any point in time is simply the sum of all such acceleration vectors, and likewise for the other particles.
