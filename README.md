# Evolution Simulator

An interactive program that demonstrates how a population can evolve over time.

* [Try it online](https://owenbechtel.com/games/evolution-simulator)
* To compile, run `npx tsc && npx browserify js/main.js -o game.js`

## Creatures

The population in each generation consists of 100 "creatures". A creature is simply a collection of particles, along with a set of rules for how those particles interact over time. Specifically, for each ordered pair _(P, Q)_ of distinct particles, there is a minimum radius _r<sub>0</sub>_, a maximum radius _r<sub>1</sub>_, and an attraction _a_. If the distance between _P_ and _Q_ is greater than _r<sub>0</sub>_ but less than _r<sub>1</sub>_, then particle _P_ will accelerate in the direction of particle _Q_ with magnitude _a_. The total acceleration of particle _P_ at any point in time is simply the sum of all such acceleration vectors, and likewise for the other particles.

The evolutionary fitness of a creature is defined as _n / (p<sup>x</sup)_, where _n_ is the total number of particle interactions over the course of ten seconds, _p_ is the number of particles in the creature, and _x_ is a constant, set to 1.85 by default. (_x_ is called the "mass exponent"; you can change it before launching the simulation.) Higher values of _x_ tend to favor small creatures, and lower values of _x_ tend to favor large creatures.

## Generations

Press the "sort by fitness" button to sort the creatures by their fitness, with the best-performing creatures on top. You can hover over a creature to see its fitness (along with its domain and phylum), or click on a creature to see its behavior over time.

Once the creatures have been sorted, click "filter population". This will kill off about half of the creatures, with better-performing creatures more likely to survive.

Click "create offspring" to continue to the next generation. Each surviving creature produces 2 descendants on average, which are slightly mutated compared to their parent. Every property of a creature, including initial position of particles, min and max radii of forces, attraction level between particles, and even the number of particles, can mutate from one generation to the next. There are many constants governing the mutation process, which you can change before launching the simulation.

## Domains and phyla

Each creature has a "domain" and a "phylum", which you can see by hovering over it. The domain ranges from 0 to 99 and tells you which original creature the creature is descended from. The phylum is initially equal to the domain, but changes each time a particle is added or deleted between one generation and the next. Creatures with the same phylum always have the same number of particles in approximately the same positions.

You can search for creatures by their phylum using the box on the right. This allows you to see how many creatures of a given phylum there are, and to detect when a phylum has gone extinct.

## Disasters

There are two buttons that allow you to alter the course of evolution:

* After typing a phylum number in the search bar, you can click "Mass extinction" to kill every creature with that phylum, instead of killing creatures based on their fitness.
* The "Alien invasion" button replaces all of the grayed-out creatures with new, randomly-generated creatures. These "alien" creatures and their descendants have domains greater than 99.
