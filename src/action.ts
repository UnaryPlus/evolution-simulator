export { Action, sortByFitness, filterGradient, killPhylum, createOffspring, alienInvasion }

import Creature from './creature'

type Action = 'sort' | 'filter' | 'create'

function sortByFitness(creatures:Creature[]) : void {
  creatures.sort((cr1:Creature, cr2:Creature) => cr2.fitness - cr1.fitness)
}

function filterGradient(creatures:Creature[]) : boolean[] {
  const deleted:boolean[] = []
  for(let i = 0; i < creatures.length; i++) {
    const prob = i / (creatures.length - 1)
    deleted.push(Math.random() < prob)
  }
  return deleted
}

function killPhylum(creatures:Creature[], phylum:string|number) : null|boolean[] {
  const phy:number =
      phylum === '' ? -1
    : isNaN(+phylum) ? -1
    : +phylum
  const deleted:boolean[] = []
  let hasFalse = false
  let hasTrue = false
  creatures.forEach((cr:Creature) => {
    if(cr.phylum === phy) hasTrue = true
    else hasFalse = true
    deleted.push(cr.phylum === phy)
  })
  if(hasFalse && hasTrue) return deleted
  return null
}

function createOffspring(creatures:Creature[], deleted:boolean[]) : Creature[] {
  const offspring:Creature[] = []
  while(true) {
    for(let i = 0; i < creatures.length; i++) {
      if(!deleted[i]) {
        offspring.push(Creature.mutate(creatures[i]))
        if(offspring.length === creatures.length) {
          return offspring
        }
      }
    }
  }
}

function alienInvasion(creatures:Creature[], deleted:boolean[]) : void {
  for(let i = 0; i < creatures.length; i++) {
    if(deleted[i]) {
      creatures[i] = Creature.random()
    }
  }
}
