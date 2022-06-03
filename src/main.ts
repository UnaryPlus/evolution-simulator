import clone from 'clone'
import { stripIndent } from 'common-tags'
import p5 from 'p5'

const FRICTION = 0.01
const PARTICLE_ADVANTAGE = 0

const MIN_PARTICLES = 4
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
  readonly domain:number
  readonly fitness:number
  trialParticles:Particle[]

  constructor(p:p5, particles:Particle[], domain:number) {
    this.particles = particles
    this.domain = domain
    this.trialParticles = clone(particles)
    for(let i = 0; i < 600; i++) {
      this.update(p)
    }
    this.fitness = this.currentFitness(p)
    this.reset()
  }

  static random(p:p5, domain:number) : Creature {
    const n = p.floor(p.random(MIN_PARTICLES, MAX_PARTICLES + 1))
    const particles:Particle[] = Array.from({ length:n }, () => randomParticle(p, n))
    return new Creature(p, particles, domain)
  }

  static mutate(p:p5, cr:Creature) : Creature {
    const particles = cr.particles.map((pt:Particle) =>
      mutateParticle(p, pt)
    )
    if(p.random() < DEL_MUTATION_PROB && particles.length > MIN_PARTICLES) {
      const index = p.floor(p.random(particles.length))
      particles.splice(index, 1)
      particles.forEach((pt:Particle) => pt.forces.splice(index, 1))
    }
    if(p.random() < ADD_MUTATION_PROB && particles.length < MAX_PARTICLES) {
      const newPt = randomParticle(p, particles.length + 1)
      particles.forEach((pt:Particle) => pt.forces.push(randomForce(p)))
      particles.push(newPt)
    }
    return new Creature(p, particles, cr.domain)
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
    const advantage = this.particles.length * PARTICLE_ADVANTAGE
    return p5.Vector.dist(oldCenter, newCenter) + advantage
    /*
    // OLD ALGORITHM
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
    */
  }

  display(p:p5, x:number, y:number, size:number, deleted:boolean) : void {
    const scale = size / CR_SIZE
    this.trialParticles.forEach((pt:Particle) => {
      p.fill(deleted ? 225 : 0)
      p.noStroke()
      p.circle(pt.pos.x * scale + x, pt.pos.y * scale + y, 10 * scale)
    })
  }
}

type Statistics = {
  meanFitness:number,
  minFitness:number,
  maxFitness:number,
  meanParticles:number,
  meanMinRadius:number,
  meanMaxRadius:number,
  meanAttraction:number
}

function getStatistics(p:p5, creatures:Creature[]) : Statistics {
  let sumFitness = 0
  let minFitness = Infinity
  let maxFitness = -Infinity
  let totalParticles = 0
  creatures.forEach((cr:Creature) => {
    sumFitness += cr.fitness
    minFitness = p.min(minFitness, cr.fitness)
    maxFitness = p.max(maxFitness, cr.fitness)
    totalParticles += cr.particles.length
  })

  let sumMinRadius = 0
  let sumMaxRadius = 0
  let sumAttraction = 0
  let totalForces = 0
  creatures.forEach((cr:Creature) => {
    for(let i = 0; i < cr.particles.length; i++) {
      for(let j = 0; j < cr.particles.length; j++) {
        if(i === j) continue
        const force = cr.particles[i].forces[j]
        sumMinRadius += force.minRadius
        sumMaxRadius += force.maxRadius
        sumAttraction += force.attraction
        totalForces += 1
      }
    }
  })

  return {
    meanFitness : sumFitness / creatures.length,
    minFitness : minFitness,
    maxFitness : maxFitness,
    meanParticles : totalParticles / creatures.length,
    meanMinRadius : sumMinRadius / totalForces,
    meanMaxRadius : sumMaxRadius / totalForces,
    meanAttraction : sumAttraction / totalForces
  }
}

function filterGradient(p:p5, creatures:Creature[]) : boolean[] {
  const deleted:boolean[] = []
  for(let i = 0; i < creatures.length; i++) {
    const prob = p.map(i, 0, creatures.length - 1, 0, 1)
    deleted.push(p.random() < prob)
  }
  return deleted
}

function createOffspring(p:p5, creatures:Creature[], deleted:boolean[]) : Creature[] {
  const offspring:Creature[] = []
  while(true) {
    for(let i = 0; i < creatures.length; i++) {
      if(!deleted[i]) {
        offspring.push(Creature.mutate(p, creatures[i]))
        if(offspring.length === creatures.length) {
          return offspring
        }
      }
    }
  }
}

type Action = 'sort' | 'filter' | 'mutate'

function sketch(p:p5) {
  let creatures:Creature[]
  let deleted:boolean[]
  let button:p5.Element
  let action:Action
  let generation:number = 0

  p.setup = function() : void {
    const canvas = p.createCanvas(800, 610)
    canvas.parent('game')
    canvas.style('border', '1px solid black')
    canvas.elt.onselectstart = () => false

    creatures = []
    for(let i = 0; i < 100; i++) {
      creatures.push(Creature.random(p, i))
    }

    deleted = Array.from({ length:100 }, () => false)

    button = p.createButton("Sort by fitness")
    button.position(620, 400)
    button.mouseClicked(buttonClicked)
    action = 'sort'

    drawGrid()
    drawStatistics()
  }

  function buttonClicked() : void {
    if(action === 'sort') {
      creatures.sort((cr1:Creature, cr2:Creature) => cr2.fitness - cr1.fitness)
      button.html('Filter population')
      action = 'filter'
      drawGrid()
      drawStatistics()
    }
    else if(action === 'filter') {
      deleted = filterGradient(p, creatures)
      button.html('Create offspring')
      action = 'mutate'
      drawGrid()
      drawStatistics()
    }
    else if(action === 'mutate') {
      creatures = createOffspring(p, creatures, deleted)
      deleted = Array.from({ length:100 }, () => false)
      generation += 1
      button.html('Sort by fitness')
      action = 'sort'
      drawGrid()
      drawStatistics()
    }
  }

  function drawGrid() : void {
    p.fill(255)
    p.noStroke()
    p.rect(0, 0, 605, 610)
    for(let i = 0; i < 10; i++) {
      for(let j = 0; j < 10; j++) {
        const cr = creatures[i * 10 + j]
        const del = deleted[i * 10 + j]
        const x = j * 60 + 10
        const y = i * 60 + 10
        p.noFill()
        p.stroke(del ? 225 : 0)
        p.rect(x, y, 50, 50)
        cr.display(p, x + 5, y + 5, 40, del)
      }
    }
  }

  function drawStatistics() : void {
    const st = getStatistics(p, creatures)
    p.fill(255)
    p.noStroke()
    p.rect(605, 5, 190, 135)
    p.fill(0)
    p.noStroke()
    p.textSize(16)
    const state:string =
      action === 'sort' ? ''
      : action === 'filter' ? ' (sorted)'
      : ' (filtered)'
    p.text('Generation ' + generation + state, 610, 25)
    p.textSize(12)
    p.text(stripIndent`
      mean fitness: ${st.meanFitness.toFixed(2)}
      min fitness: ${st.minFitness.toFixed(2)}
      max fitness: ${st.maxFitness.toFixed(2)}
      mean number of particles: ${st.meanParticles.toFixed(2)}
      mean min force radius: ${st.meanMinRadius.toFixed(2)}
      mean max force radius: ${st.meanMaxRadius.toFixed(2)}
      mean attraction: ${st.meanAttraction.toFixed(2)}
      `, 610, 47)
  }

  p.draw = function() : void {
    p.fill(255)
    p.noStroke()
    p.rect(605, 145, 190, 60)
    if(p.mouseX < 610) {
      const i = p.constrain(p.floor((p.mouseY - 5) / 60), 0, 9)
      const j = p.constrain(p.floor((p.mouseX - 5) / 60), 0, 9)
      const cr = creatures[i * 10 + j]
      p.fill(0)
      p.noStroke()
      p.textSize(12)
      p.text(stripIndent`
        domain: ${cr.domain}
        fitness: ${cr.fitness.toFixed(2)}
        number of particles: ${cr.particles.length}
        `, 610, 160)
    }
  }
}

new p5(sketch)
