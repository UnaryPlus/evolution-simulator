export { Action, sortByFitness, filterGradient, createOffspring }

import { p } from './global'
import Creature from './creature'

type Action = 'sort' | 'filter' | 'create'

function sortByFitness(creatures:Creature[]) : void {
  creatures.sort((cr1:Creature, cr2:Creature) => cr2.fitness - cr1.fitness)
}

function filterGradient(creatures:Creature[]) : boolean[] {
  const deleted:boolean[] = []
  for(let i = 0; i < creatures.length; i++) {
    const prob = p.map(i, 0, creatures.length - 1, 0, 1)
    deleted.push(p.random() < prob)
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
