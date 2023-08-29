// events.ts
import mitt from 'mitt'
import { Action } from '@dcl/quests-client'

export const startEvent = mitt()
export const actionEvents = mitt<{ action: Action }>()
export const questProgress = mitt<{ step: number }>()