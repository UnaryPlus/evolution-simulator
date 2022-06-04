export { drawGrid, drawHeading, drawStatistics, getCreature, drawCreatureData, drawCreature }

import { stripIndent } from 'common-tags'
import p5 from 'p5'

import { gen, constrain } from './global'
import Creature from './creature'
import { Action } from './action'

type Statistics = {
  meanFitness:number,
  minFitness:number,
  maxFitness:number,
  meanParticles:number,
  meanMinRadius:number,
  meanMaxRadius:number,
  meanAttraction:number
}

function getStatistics(creatures:Creature[]) : Statistics {
  let sumFitness = 0
  let minFitness = Infinity
  let maxFitness = -Infinity
  let totalParticles = 0
  creatures.forEach((cr:Creature) => {
    sumFitness += cr.fitness
    minFitness = Math.min(minFitness, cr.fitness)
    maxFitness = Math.max(maxFitness, cr.fitness)
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

function drawGrid(p:p5, creatures:Creature[], deleted:boolean[], phylum:string|number) : void {
  const phy:number =
      phylum === '' ? -1
    : isNaN(+phylum) ? -1
    : +phylum
  p.fill(255)
  p.noStroke()
  p.rect(0, 0, 605, 610)
  for(let i = 0; i < 10; i++) {
    for(let j = 0; j < 10; j++) {
      const cr = creatures[i * 10 + j]
      const dead = deleted[i * 10 + j]
      const searched = cr.phylum === phy
      const color =
          dead && searched ? p.color(255, 225, 225)
        : dead ? p.color(225, 225, 225)
        : searched ? p.color(255, 0, 0)
        : p.color(0, 0, 0)
      const x = j * 60 + 10
      const y = i * 60 + 10
      p.noFill()
      p.stroke(color)
      p.strokeWeight(searched ? 2 : 1)
      p.rect(x, y, 50, 50)
      p.fill(color)
      p.noStroke()
      cr.display(p, x + 5, y + 5, 40)
    }
  }
}

function drawHeading(p:p5, generation:number, action:Action) {
  p.fill(255)
  p.noStroke()
  p.rect(605, 5, 190, 25)
  p.fill(0)
  p.textSize(16)
  const state:string =
    action === 'sort' ? ''
    : action === 'filter' ? ' (sorted)'
    : ' (filtered)'
  p.text('Generation ' + generation + state, 610, 25)
}

function drawStatistics(p:p5, creatures:Creature[]) : void {
  const st = getStatistics(creatures)
  p.fill(255)
  p.noStroke()
  p.rect(605, 35, 190, 105)
  p.fill(0)
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

function getCreature(p:p5, creatures:Creature[]) : Creature|null {
  if(p.mouseX < 610) {
    const i = constrain(Math.floor((p.mouseY - 5) / 60), 0, 9)
    const j = constrain(Math.floor((p.mouseX - 5) / 60), 0, 9)
    return creatures[i * 10 + j]
  }
  return null
}

function drawCreatureData(p:p5, creatures:Creature[]) : void {
  p.fill(255)
  p.noStroke()
  p.rect(605, 145, 190, 70)
  const cr = getCreature(p, creatures)
  if(cr !== null) {
    p.fill(0)
    p.textSize(12)
    p.text(stripIndent`
      domain: ${cr.domain}
      phylum: ${cr.phylum}
      fitness: ${cr.fitness.toFixed(2)}
      number of particles: ${cr.particles.length}
      `, 610, 160)
  }
}

function drawCreature(p:p5, cr:Creature) : void {
  p.background(255)
  p.stroke(225)
  for(let x = 10; x < p.width; x += 30) {
    p.line(x, 0, x, p.height)
  }
  for(let y = 20; y < p.width; y += 30) {
    p.line(0, y, p.width, y)
  }
  const x = p.width / 2 - gen.creatureSize / 2
  const y = p.height / 2 - gen.creatureSize / 2
  p.fill(0)
  p.noStroke()
  cr.display(p, x, y, gen.creatureSize)
  cr.update()
}
