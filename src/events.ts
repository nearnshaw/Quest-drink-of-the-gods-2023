// events.ts
import mitt from 'mitt'

export const startEvent = mitt()
export const questProgress = mitt<{ step: number }>()