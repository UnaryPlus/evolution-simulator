export { env, gen, mut, random, randomInt, randomGaussian, constrain }

const env = {
  friction:0.01,
  massPower:1.85,
  trialTime:600
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

function random(min:number, max:number) : number {
  return Math.random() * (max - min) + min
}

function randomInt(min:number, max:number) : number {
  return Math.floor(random(min, max))
}

function randomGaussian(mean:number, std:number) : number {
  return Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2.0 * Math.PI * Math.random()) * std + mean
}

function constrain(x:number, min:number, max:number) : number {
  return x < min ? min : x > max ? max : x
}
