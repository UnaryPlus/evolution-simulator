export { Action, sortByFitness, filterGradient, createOffspring }

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
