export { Particle, randomForce, randomParticle, mutateParticle }

import p5 from "p5"

import { gen, mut, random, randomGaussian, constrain } from "./global"

type Force = {
  minRadius:number,
  maxRadius:number,
  attraction:number
}

type Particle = {
  pos:p5.Vector,
  vel:p5.Vector,
  forces:Force[]
}

function randomForce() : Force {
  return {
    minRadius : random(gen.minRadiusMin, gen.minRadiusMax),
    maxRadius : random(gen.maxRadiusMin, gen.maxRadiusMax),
    attraction : randomGaussian(gen.attractionMean, gen.attractionStd)
  }
}

function randomParticle(n:number) : Particle {
  return {
    pos : new p5.Vector(random(0, gen.creatureSize), random(0, gen.creatureSize)),
    vel : new p5.Vector(0, 0),
    forces : Array.from({ length:n }, () => randomForce())
  }
}

function mutateForce(force:Force) : Force {
  const minRadius = Math.random() < mut.minRadiusProb
    ? randomGaussian(force.minRadius, mut.minRadiusStd)
    : force.minRadius
  const maxRadius = Math.random() < mut.maxRadiusProb
    ? randomGaussian(force.maxRadius, mut.maxRadiusStd)
    : force.maxRadius
  const attraction = Math.random() < mut.attractionProb
    ? randomGaussian(force.attraction, mut.attractionStd)
    : force.attraction
  return {
    minRadius : constrain(minRadius, gen.minRadiusMin, gen.minRadiusMax),
    maxRadius : constrain(maxRadius, gen.maxRadiusMin, gen.maxRadiusMax),
    attraction : attraction
  }
}

function mutatePos(pos:p5.Vector) : p5.Vector {
  if(Math.random() < mut.positionProb) {
    return new p5.Vector(
      constrain(randomGaussian(pos.x, mut.positionStd), 0, gen.creatureSize),
      constrain(randomGaussian(pos.y, mut.positionStd), 0, gen.creatureSize)
    )
  }
  return pos
}

function mutateParticle(pt:Particle) : Particle {
  return {
    pos : mutatePos(pt.pos),
    vel : new p5.Vector(0, 0),
    forces : pt.forces.map((f:Force) => mutateForce(f))
  }
}
