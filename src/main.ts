import p5 from 'p5'

import Creature from './creature'
import { drawGrid, drawHeading, drawStatistics, getCreature, drawCreatureData, drawCreature } from './view'
import { Action, sortByFitness, filterGradient, killPhylum, createOffspring } from './action'

function sketch(p:p5) {
  let creatures:Creature[]
  let deleted:boolean[]

  let mainButton:p5.Element
  let skipButton:p5.Element
  let backButton:p5.Element
  let resetButton:p5.Element
  let killButton:p5.Element
  let phylumSearch:p5.Element

  let action:Action
  let zoomed:Creature|null = null
  let generation:number = 0

  function createButton(text:string, x:number, y:number, callback : () => void) : p5.Element{
    const button = p.createButton(text)
    button.position(x, y)
    button.mouseClicked(callback)
    button.elt.onselectstart = () => false
    return button
  }

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

    mainButton = createButton("Sort by fitness", 620, 300, mainClicked)
    skipButton = createButton("Skip 10 generations", 620, 340, skipClicked)
    killButton = createButton("Mass extinction", 620, 340, killClicked).hide()
    backButton = createButton("Back", 20, 20, backClicked).hide()
    resetButton = createButton("Reset", 75, 20, resetClicked).hide()

    phylumSearch = p.createInput("", "number")
    phylumSearch.position(620, 380)
    // @ts-ignore
    phylumSearch.input(() => drawGrid(p, creatures, deleted, phylumSearch.value()))
    phylumSearch.elt.placeholder = "Phylum"

    action = 'sort'
    drawGrid(p, creatures, deleted, phylumSearch.value())
    drawHeading(p, generation, action)
    drawStatistics(p, creatures)
  }

  p.draw = function() : void {
    if(zoomed === null) {
      drawCreatureData(p, creatures)
    }
    else {
      drawCreature(p, zoomed)
    }
  }

  function canvasClicked() : void {
    if(zoomed === null) {
      zoomed = getCreature(p, creatures)
      if(zoomed !== null) {
        mainButton.hide()
        skipButton.hide()
        killButton.hide()
        phylumSearch.hide()
        backButton.show()
        resetButton.show()
      }
    }
  }

  function mainClicked() : void {
    if(action === 'sort') {
      sortByFitness(creatures)
      skipButton.hide()
      killButton.show()
      mainButton.html('Filter population')
      action = 'filter'
    }
    else if(action === 'filter') {
      deleted = filterGradient(creatures)
      killButton.hide()
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
      drawStatistics(p, creatures)
    }
    drawGrid(p, creatures, deleted, phylumSearch.value())
    drawHeading(p, generation, action)
  }

  function skipClicked() : void {
    for(let i = 0; i < 10; i++) {
      sortByFitness(creatures)
      deleted = filterGradient(creatures)
      creatures = createOffspring(creatures, deleted)
      deleted = Array.from({ length:100 }, () => false)
    }
    generation += 10
    drawGrid(p, creatures, deleted, phylumSearch.value())
    drawHeading(p, generation, action)
    drawStatistics(p, creatures)
  }

  function killClicked() : void {
    const del = killPhylum(creatures, phylumSearch.value())
    if(del !== null) {
      deleted = del
      killButton.hide()
      mainButton.html('Create offspring')
      action = 'create'
    }
    drawGrid(p, creatures, deleted, phylumSearch.value())
    drawHeading(p, generation, action)
  }

  function backClicked() : void {
    if(zoomed !== null) zoomed.reset()
    zoomed = null
    backButton.hide()
    resetButton.hide()
    mainButton.show()
    phylumSearch.show()
    if(action === 'sort') skipButton.show()
    if(action === 'filter') killButton.show()
    p.background(255)
    drawGrid(p, creatures, deleted, phylumSearch.value())
    drawHeading(p, generation, action)
    drawStatistics(p, creatures)
  }

  function resetClicked() : void {
    if(zoomed !== null) zoomed.reset()
  }
}

new p5(sketch)
