// events.ts
import { Action } from '@dcl/quests-client/dist/protocol/decentraland/quests/definitions.gen'
import mitt from 'mitt'


export const startEvent = mitt()
export const actionEvents = mitt<{ action: Action }>()
export const questProgress = mitt<{ step: number }>()