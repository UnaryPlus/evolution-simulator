import p5 from 'p5'

import { p, setInstance } from './global'
import Creature from './creature'
import { drawGrid, drawHeading, drawStatistics, getCreature, drawCreatureData, drawCreature } from './view'
import { Action, sortByFitness, filterGradient, createOffspring } from './action'

function sketch(instance:p5) {
  setInstance(instance)

  let creatures:Creature[]
  let deleted:boolean[]

  let mainButton:p5.Element
  let skipButton:p5.Element
  let backButton:p5.Element
  let resetButton:p5.Element

  let action:Action
  let zoomed:Creature|null = null
  let generation:number = 0

  p.setup = function() : void {
    const canvas = p.createCanvas(800, 610)
    canvas.parent('game')
    canvas.style('border', '1px solid black')
    canvas.mouseClicked(canvasClicked)
    canvas.elt.onselectstart = () => false

    creatures = []
    for(let i = 0; i < 100; i++) {
      creatures.push(Creature.random())
    }

    deleted = Array.from({ length:100 }, () => false)

    mainButton = p.createButton("Sort by fitness")
    mainButton.position(620, 300)
    mainButton.mouseClicked(mainClicked)
    mainButton.elt.onselectstart = () => false
    action = 'sort'

    skipButton = p.createButton("Skip 10 generations")
    skipButton.position(620, 350)
    skipButton.mouseClicked(skipClicked)
    skipButton.elt.onselectstart = () => false

    backButton = p.createButton("Back")
    backButton.position(20, 20)
    backButton.mouseClicked(backClicked)
    backButton.elt.onselectstart = () => false
    backButton.hide()

    resetButton = p.createButton("Reset")
    resetButton.position(75, 20)
    resetButton.mouseClicked(resetClicked)
    resetButton.elt.onselectstart = () => false
    resetButton.hide()

    drawGrid(creatures, deleted)
    drawHeading(generation, action)
    drawStatistics(creatures)
  }

  p.draw = function() : void {
    if(zoomed === null) {
      drawCreatureData(creatures)
    }
    else {
      drawCreature(zoomed)
    }
  }

  function canvasClicked() : void {
    if(zoomed === null) {
      zoomed = getCreature(creatures)
      if(zoomed !== null) {
        mainButton.hide()
        skipButton.hide()
        backButton.show()
        resetButton.show()
      }
    }
  }

  function mainClicked() : void {
    if(action === 'sort') {
      sortByFitness(creatures)
      skipButton.hide()
      mainButton.html('Filter population')
      action = 'filter'
    }
    else if(action === 'filter') {
      deleted = filterGradient(creatures)
      mainButton.html('Create offspring')
      action = 'create'
    }
    else if(action === 'create') {
      creatures = createOffspring(creatures, deleted)
      deleted = Array.from({ length:100 }, () => false)
      generation += 1
      skipButton.show()
      mainButton.html('Sort by fitness')
      action = 'sort'
      drawStatistics(creatures)
    }
    drawGrid(creatures, deleted)
    drawHeading(generation, action)
  }

  function skipClicked() : void {
    for(let i = 0; i < 10; i++) {
      sortByFitness(creatures)
      deleted = filterGradient(creatures)
      creatures = createOffspring(creatures, deleted)
      deleted = Array.from({ length:100 }, () => false)
    }
    generation += 10
    drawGrid(creatures, deleted)
    drawHeading(generation, action)
    drawStatistics(creatures)
  }

  function backClicked() : void {
    if(zoomed !== null) zoomed.reset()
    zoomed = null
    backButton.hide()
    resetButton.hide()
    mainButton.show()
    if(action === 'sort') skipButton.show()
    p.background(255)
    drawGrid(creatures, deleted)
    drawHeading(generation, action)
    drawStatistics(creatures)
  }

  function resetClicked() : void {
    if(zoomed !== null) zoomed.reset()
  }
}

new p5(sketch)
