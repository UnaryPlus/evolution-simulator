import p5 from "p5"

import { setConstants } from "./global"
import Creature from "./creature"
import { drawGrid, drawHeading, drawStatistics, getCreature, drawCreatureData, drawCreature } from "./view"
import { Action, sortByFitness, filterGradient, killPhylum, createOffspring, alienInvasion } from "./action"

function sketch(p:p5) {

let creatures:Creature[]
let deleted:boolean[]

let mainButton:p5.Element
let skipButton:p5.Element
let killButton:p5.Element
let alienButton:p5.Element
let backButton:p5.Element
let resetButton:p5.Element
let phylumSearch:p5.Element

let action:Action
let zoomed:Creature|null = null
let generation:number = 0

function createButton(text:string, x:number, y:number, callback : () => void) : p5.Element{
  const button = p.createButton(text)
  button.parent("game")
  button.class("override")
  button.position(x, y)
  button.mouseClicked(callback)
  button.elt.onselectstart = () => false
  return button
}

p.setup = function() : void {
  setConstants()

  const canvas = p.createCanvas(800, 612)
  canvas.parent("game")
  canvas.style("border", "1px solid black")
  canvas.mouseClicked(canvasClicked)
  canvas.elt.onselectstart = () => false

  creatures = []
  for(let i = 0; i < 100; i++) {
    creatures.push(Creature.random())
  }
  deleted = Array.from({ length:100 }, () => false)

  mainButton = createButton("Sort by fitness", 610, 300, mainClicked)
  skipButton = createButton("Skip 10 generations", 610, 340, skipClicked)
  killButton = createButton("Mass extinction", 610, 340, killClicked).hide()
  alienButton = createButton("Alien invasion", 610, 340, alienClicked).hide()
  backButton = createButton("Back", 20, 20, backClicked).hide()
  resetButton = createButton("Reset", 75, 20, resetClicked).hide()

  phylumSearch = p.createInput("", "number")
  phylumSearch.parent("game")
  phylumSearch.position(610, 380).size(170)
  // @ts-ignore
  phylumSearch.input(() => drawGrid(p, creatures, deleted, phylumSearch.value()))
  phylumSearch.elt.placeholder = "Phylum"

  action = "sort"
  p.text("Click on a creature to view\nits behavior.", 610, 427)
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
      alienButton.hide()
      phylumSearch.hide()
      backButton.show()
      resetButton.show()
    }
  }
}

function setCreate() : void {
  killButton.hide()
  alienButton.show()
  mainButton.html("Create offspring")
  action = "create"
  drawGrid(p, creatures, deleted, phylumSearch.value())
  drawHeading(p, generation, action)
}

function nextGen() : void {
  deleted = Array.from({ length:100 }, () => false)
  generation += 1
  alienButton.hide()
  skipButton.show()
  mainButton.html("Sort by fitness")
  action = "sort"
  drawGrid(p, creatures, deleted, phylumSearch.value())
  drawHeading(p, generation, action)
  drawStatistics(p, creatures)
}

function mainClicked() : void {
  if(action === "sort") {
    sortByFitness(creatures)
    skipButton.hide()
    killButton.show()
    mainButton.html("Filter population")
    action = "filter"
    drawGrid(p, creatures, deleted, phylumSearch.value())
    drawHeading(p, generation, action)
  }
  else if(action === "filter") {
    deleted = filterGradient(creatures)
    setCreate()
  }
  else if(action === "create") {
    creatures = createOffspring(creatures, deleted)
    nextGen()
  }
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
    setCreate()
  }
}

function alienClicked() : void {
  alienInvasion(creatures, deleted)
  nextGen()
}

function backClicked() : void {
  if(zoomed !== null) zoomed.reset()
  zoomed = null
  backButton.hide()
  resetButton.hide()
  mainButton.show()
  phylumSearch.show()
  if(action === "sort") skipButton.show()
  if(action === "filter") killButton.show()
  if(action === "create") alienButton.show()

  p.background(255)
  p.text("Click on a creature to view\nits behavior.", 610, 427)
  drawGrid(p, creatures, deleted, phylumSearch.value())
  drawHeading(p, generation, action)
  drawStatistics(p, creatures)
}

function resetClicked() : void {
  if(zoomed !== null) zoomed.reset()
}

} //end sketch function

const form = document.getElementById("config")
if(form !== null) {
  form.onsubmit = function() {
    setConstants()
    form.style.display = "none"
    new p5(sketch)
    return false
  }
}
