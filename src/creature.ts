import clone from "clone"
import p5 from "p5"

import { env, gen, mut, randomInt } from "./global"
import { Particle, randomForce, randomParticle, mutateParticle } from "./particle"

const next = {
  domain:0,
  phylum:0
}

export default class Creature {
  readonly particles:Particle[]
  readonly domain:number
  readonly phylum:number
  readonly fitness:number
  trialParticles:Particle[]
  interactions:number

  constructor(particles:Particle[], domain:number, phylum:number) {
    this.particles = particles
    this.domain = domain
    this.phylum = phylum
    this.trialParticles = clone(particles)
    this.interactions = 0
    for(let i = 0; i < env.trialTime; i++) {
      this.update()
    }
    this.fitness = this.interactions / this.particles.length ** env.massPower
    this.reset()
  }

  static random() : Creature {
    const n = randomInt(gen.minParticles, gen.maxParticles + 1)
    const particles:Particle[] = Array.from({ length:n }, () => randomParticle(n))
    const domain = next.domain++
    const phylum = next.phylum++
    return new Creature(particles, domain, phylum)
  }

  static mutate(cr:Creature) : Creature {
    const particles = cr.particles.map((pt:Particle) =>
      mutateParticle(pt))
    let newPhylum = false
    if(Math.random() < mut.deletionProb && particles.length > gen.minParticles) {
      const index = randomInt(0, particles.length)
      particles.splice(index, 1)
      particles.forEach((pt:Particle) => pt.forces.splice(index, 1))
      newPhylum = true
    }
    if(Math.random() < mut.additionProb && particles.length < gen.maxParticles) {
      const newPt = randomParticle(particles.length + 1)
      particles.forEach((pt:Particle) => pt.forces.push(randomForce()))
      particles.push(newPt)
      newPhylum = true
    }
    const phylum = newPhylum ? next.phylum++ : cr.phylum
    return new Creature(particles, cr.domain, phylum)
  }

  reset() : void {
    this.trialParticles = clone(this.particles)
    this.interactions = 0
  }

  update() : void {
    const accelerations:p5.Vector[] = []
    for(let i = 0; i < this.trialParticles.length; i++) {
      const pt = this.trialParticles[i]
      const acc = new p5.Vector(0, 0)
      for(let j = 0; j < this.trialParticles.length; j++) {
        if(i === j) continue
        const pt2 = this.trialParticles[j]
        const force = pt.forces[j]
        const dist = p5.Vector.sub(pt2.pos, pt.pos)
        if(dist.mag() > force.minRadius && dist.mag() < force.maxRadius) {
          this.interactions += 1
          dist.setMag(force.attraction)
          acc.add(dist)
        }
      }
      accelerations.push(acc)
    }

    for(let i = 0; i < this.trialParticles.length; i++) {
      const pt = this.trialParticles[i]
      pt.vel.add(accelerations[i])
      pt.vel.mult(1 - env.friction)
      pt.pos.add(pt.vel)
    }
  }

  display(p:p5, x:number, y:number, size:number) : void {
    const scale = size / gen.creatureSize
    this.trialParticles.forEach((pt:Particle) => {
      p.circle(pt.pos.x * scale + x, pt.pos.y * scale + y, 10 * scale)
    })
  }
}
