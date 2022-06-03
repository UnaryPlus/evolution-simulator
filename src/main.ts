import p5 from 'p5'

import { p } from './global'
import Creature from './creature'
import { drawGrid, drawHeading, drawStatistics, drawCreatureData } from './view'
import { Action, sortByFitness, filterGradient, createOffspring } from './action'

function sketch(instance:p5) {
  p = instance

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
      creatures.push(Creature.random(i))
    }

    deleted = Array.from({ length:100 }, () => false)

    button = p.createButton("Sort by fitness")
    button.position(620, 300)
    button.mouseClicked(buttonClicked)
    action = 'sort'

    drawGrid(creatures, deleted)
    drawHeading(generation, action)
    drawStatistics(creatures)
  }

  p.draw = function() : void {
    drawCreatureData(creatures)
  }

  function buttonClicked() : void {
    if(action === 'sort') {
      creatures.sort((cr1:Creature, cr2:Creature) => cr2.fitness - cr1.fitness)
      button.html('Filter population')
      action = 'filter'
    }
    else if(action === 'filter') {
      deleted = filterGradient(creatures)
      button.html('Create offspring')
      action = 'create'
    }
    else if(action === 'create') {
      creatures = createOffspring(creatures, deleted)
      deleted = Array.from({ length:100 }, () => false)
      generation += 1
      button.html('Sort by fitness')
      action = 'sort'
      drawStatistics(creatures)
    }
    drawGrid(creatures, deleted)
    drawHeading(generation, action)
  }
}

new p5(sketch)
