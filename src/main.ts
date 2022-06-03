import clone from 'clone'
import p5 from 'p5'

const FRICTION = 0.01
const MIN_PARTICLES = 3
const MAX_PARTICLES = 10
const CR_SIZE = 100
const MIN_MINR = 15
const MAX_MINR = 30
const MIN_MAXR = 30
const MAX_MAXR = 100
const ATTRACT_MEAN = 0.2
const ATTRACT_STD = 0.2

const POS_MUTATION_PROB = 0.2
const POS_MUTATION_STD = 3
const MINR_MUTATION_PROB = 0.2
const MINR_MUTATION_STD = 3
const MAXR_MUTATION_PROB = 0.2
const MAXR_MUTATION_STD = 5
const ATTRACT_MUTATION_PROB = 0.2
const ATTRACT_MUTATION_STD = 0.1

const DEL_MUTATION_PROB = 0.05
const ADD_MUTATION_PROB = 0.05

type Force = {
  minRadius:number,
  maxRadius:number,
  attraction:number
}

function randomForce(p:p5) : Force {
  return {
    minRadius : p.random(MIN_MINR, MAX_MINR),
    maxRadius : p.random(MIN_MAXR, MAX_MAXR),
    attraction : p.randomGaussian(ATTRACT_MEAN, ATTRACT_STD)
  }
}

function mutateForce(p:p5, force:Force) : Force {
  const minRadius = p.random() < MINR_MUTATION_PROB
    ? p.randomGaussian(force.minRadius, MINR_MUTATION_STD)
    : force.minRadius
  const maxRadius = p.random() < MAXR_MUTATION_PROB
    ? p.randomGaussian(force.maxRadius, MAXR_MUTATION_STD)
    : force.maxRadius
  const attraction = p.random() < ATTRACT_MUTATION_PROB
    ? p.randomGaussian(force.attraction, ATTRACT_MUTATION_STD)
    : force.attraction
  return {
    minRadius : p.constrain(minRadius, MIN_MINR, MAX_MINR),
    maxRadius : p.constrain(maxRadius, MIN_MAXR, MAX_MAXR),
    attraction : attraction
  }
}

type Particle = {
  pos:p5.Vector,
  vel:p5.Vector,
  forces:Force[]
}

function randomParticle(p:p5, n:number) : Particle {
  return {
    pos : p.createVector(p.random(CR_SIZE), p.random(CR_SIZE)),
    vel : p.createVector(0, 0),
    forces : Array.from({ length:n }, () => randomForce(p))
  }
}

function findCenter(p:p5, particles:Particle[]) : p5.Vector {
  const avg = p.createVector(0, 0)
  for(let i = 0; i < particles.length; i++) {
    avg.add(particles[i].pos)
  }
  avg.div(particles.length)
  return avg
}

function mutatePos(p:p5, pos:p5.Vector) : p5.Vector {
  if(p.random() < POS_MUTATION_PROB) {
    return p.createVector(
      p.constrain(p.randomGaussian(pos.x, POS_MUTATION_STD), 0, CR_SIZE),
      p.constrain(p.randomGaussian(pos.y, POS_MUTATION_STD), 0, CR_SIZE)
    )
  }
  return pos
}

function mutateParticle(p:p5, pt:Particle) : Particle {
  return {
    pos : mutatePos(p, pt.pos),
    vel : p.createVector(0, 0),
    forces : pt.forces.map((f:Force) => mutateForce(p, f))
  }
}

class Creature {
  readonly particles:Particle[]
  readonly fitness:number
  trialParticles:Particle[]

  constructor(p:p5, particles:Particle[]) {
    this.particles = particles
    this.trialParticles = clone(particles)
    for(let i = 0; i < 600; i++) {
      this.update(p)
    }
    this.fitness = this.currentFitness(p)
    this.reset()
  }

  static random(p:p5) : Creature {
    const n = p.floor(p.random(MIN_PARTICLES, MAX_PARTICLES + 1))
    const particles:Particle[] = Array.from({ length:n }, () => randomParticle(p, n))
    return new Creature(p, particles)
  }

  static mutate(p:p5, cr:Creature) : Creature {
    const particles = cr.particles.map((pt:Particle) =>
      mutateParticle(p, pt)
    )
    if(p.random() < DEL_MUTATION_PROB) {
      const index = p.floor(p.random(particles.length))
      particles.splice(index, 1)
      particles.forEach((pt:Particle) => pt.forces.splice(index, 1))
    }
    if(p.random() < ADD_MUTATION_PROB) {
      const newPt = randomParticle(p, particles.length + 1)
      particles.forEach((pt:Particle) => pt.forces.push(randomForce(p)))
      particles.push(newPt)
    }
    return new Creature(p, particles)
  }

  reset() : void {
    this.trialParticles = clone(this.particles)
  }

  update(p:p5) : void {
    const accelerations:p5.Vector[] = []
    for(let i = 0; i < this.trialParticles.length; i++) {
      const pt = this.trialParticles[i]
      const acc = p.createVector(0, 0)
      for(let j = 0; j < this.trialParticles.length; j++) {
        if(i === j) continue
        const pt2 = this.trialParticles[j]
        const force = pt.forces[j]
        const dist = p5.Vector.sub(pt2.pos, pt.pos)
        if(dist.mag() > force.minRadius && dist.mag() < force.maxRadius) {
            dist.setMag(force.attraction)
            acc.add(dist)
        }
      }
      accelerations.push(acc)
    }

    for(let i = 0; i < this.trialParticles.length; i++) {
      const pt = this.trialParticles[i]
      pt.vel.add(accelerations[i])
      pt.vel.mult(1 - FRICTION)
      pt.pos.add(pt.vel)
    }
  }

  currentFitness(p:p5) : number {
    const oldCenter = findCenter(p, this.particles)
    const newCenter = findCenter(p, this.trialParticles)
    const dir = p5.Vector.sub(newCenter, oldCenter)
    dir.normalize()
    let minDist = Infinity
    for(let i = 0; i < this.trialParticles.length; i++) {
      const pos = p5.Vector.sub(this.trialParticles[i].pos, oldCenter)
      const dist = pos.dot(dir)
      minDist = p.min(minDist, dist)
    }
    return minDist
  }

  display(p:p5, x:number, y:number, size:number) : void {
    const scale = size / CR_SIZE
    this.trialParticles.forEach((pt:Particle) => {
      p.fill(0)
      p.circle(pt.pos.x * scale + x, pt.pos.y * scale + y, 8 * scale)
    })
  }
}

type Statistics = {
  medianFitness:number,
  minFitness:number,
  maxFitness:number,
  meanParticles:number,
  meanMinRadius:number,
  meanMaxRadius:number,
  meanAttraction:number
}

function getStatistics(Creature[]) : Statisticss {
  
}

function sketch(p:p5) {
  let creatures:Creature[]

  p.setup = function() : void {
    const canvas = p.createCanvas(800, 610)
    canvas.parent('game')
    canvas.style('border', '1px solid black')
    canvas.elt.onselectstart = () => false

    creatures = []
    for(let i = 0; i < 100; i++) {
      creatures.push(Creature.random(p))
    }
  }

  function drawMain() : void {
    for(let i = 0; i < 10; i++) {
      for(let j = 0; j < 10; j++) {
        const x = j * 60 + 10
        const y = i * 60 + 10
        p.noFill()
        p.stroke(0)
        p.rect(x, y, 50, 50)
        const cr = creatures[i * 10 + j]
        cr.display(p, x + 5, y + 5, 40)
      }
    }
  }
}

new p5(sketch)
