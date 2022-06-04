export { p, setInstance, env, gen, mut }

import p5 from 'p5'

let p:p5

function setInstance(instance:p5) : void {
  p = instance
}

const env = {
  friction:0.01,
  massPower:1.5
}

const gen = {
  minParticles:3,
  maxParticles:10,
  creatureSize:100,
  minRadiusMin:15,
  minRadiusMax:30,
  maxRadiusMin:30,
  maxRadiusMax:100,
  attractionMean:0.2,
  attractionStd:0.2
}

const mut = {
  positionProb:0.1,
  positionStd:3,
  minRadiusProb:0.05,
  minRadiusStd:3,
  maxRadiusProb:0.05,
  maxRadiusStd:5,
  attractionProb:0.05,
  attractionStd:0.1,
  deletionProb:0.05,
  additionProb:0.05
}
