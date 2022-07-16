export { env, gen, mut, setConstants, random, randomInt, randomGaussian, constrain }

const env = {
  friction:0.01,
  massPower:1.85,
  trialTime:600
}

const gen = {
  creatureSize:100,
  minParticles:3,
  maxParticles:10,
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

function setConstants() : void {
  function v(id:string) : number {
    const el = document.getElementById(id) as HTMLInputElement
    if(el === null) throw `element "${id}" does not exist`
    if(el.value === null || el.value === "" || isNaN(+el.value)) {
      throw `invalid value for element ${id}`
    }
    return +el.value
  }
  env.friction = v("env-friction")
  env.massPower = v("env-mass-power")
  env.trialTime = v("env-trial-time")
  gen.creatureSize = v("gen-creature-size")
  gen.minParticles = v("gen-min-particles")
  gen.maxParticles = v("gen-max-particles")
  gen.minRadiusMin = v("gen-min-radius-min")
  gen.minRadiusMax = v("gen-min-radius-max")
  gen.maxRadiusMin = v("gen-max-radius-min")
  gen.maxRadiusMax = v("gen-max-radius-max")
  gen.attractionMean = v("gen-attraction-mean")
  gen.attractionStd = v("gen-attraction-std")
  mut.positionProb = v("mut-position-prob")
  mut.positionStd = v("mut-position-std")
  mut.minRadiusProb = v("mut-min-radius-prob")
  mut.minRadiusStd = v("mut-min-radius-std")
  mut.maxRadiusProb = v("mut-max-radius-prob")
  mut.maxRadiusStd = v("mut-max-radius-std")
  mut.attractionProb = v("mut-attraction-prob")
  mut.attractionStd = v("mut-attraction-std")
  mut.deletionProb = v("mut-deletion-prob")
  mut.additionProb = v("mut-addition-prob")
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
