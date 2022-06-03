import p5 from 'p5'

import { p, gen, mut } from './global'

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
    minRadius : p.random(gen.minRadiusMin, gen.minRadiusMax),
    maxRadius : p.random(gen.maxRadiusMin, gen.maxRadiusMax),
    attraction : p.randomGaussian(gen.attractionMean, gen.attractionStd)
  }
}

function randomParticle(n:number) : Particle {
  return {
    pos : p.createVector(p.random(gen.creatureSize), p.random(gen.creatureSize)),
    vel : p.createVector(0, 0),
    forces : Array.from({ length:n }, () => randomForce())
  }
}

function mutateForce(force:Force) : Force {
  const minRadius = p.random() < mut.minRadiusProb
    ? p.randomGaussian(force.minRadius, mut.minRadiusStd)
    : force.minRadius
  const maxRadius = p.random() < mut.maxRadiusProb
    ? p.randomGaussian(force.maxRadius, mut.maxRadiusStd)
    : force.maxRadius
  const attraction = p.random() < mut.attractionProb
    ? p.randomGaussian(force.attraction, mut.attractionStd)
    : force.attraction
  return {
    minRadius : p.constrain(minRadius, gen.minRadiusMin, gen.minRadiusMax),
    maxRadius : p.constrain(maxRadius, gen.maxRadiusMin, gen.maxRadiusMax),
    attraction : attraction
  }
}

function mutatePos(pos:p5.Vector) : p5.Vector {
  if(p.random() < mut.positionProb) {
    return p.createVector(
      p.constrain(p.randomGaussian(pos.x, mut.positionStd), 0, gen.creatureSize),
      p.constrain(p.randomGaussian(pos.y, mut.positionStd), 0, gen.creatureSize)
    )
  }
  return pos
}

function mutateParticle(pt:Particle) : Particle {
  return {
    pos : mutatePos(pt.pos),
    vel : p.createVector(0, 0),
    forces : pt.forces.map((f:Force) => mutateForce(f))
  }
}

function findCenter(particles:Particle[]) : p5.Vector {
  const avg = p.createVector(0, 0)
  particles.forEach((pt:Particle) => avg.add(pt.pos))
  avg.div(particles.length)
  return avg
}
