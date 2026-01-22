import { registerMessages } from '@dcl/sdk/network'
import { Schemas } from '@dcl/sdk/ecs'

// Define message types
export enum MessageType {
	QUEST_ACTION = 'QUEST_ACTION',
	QUEST_STATE_REQUEST = 'QUEST_STATE_REQUEST',
	QUEST_STATE_UPDATE = 'QUEST_STATE_UPDATE',
	QUEST_RESET = 'QUEST_RESET'
}

// Define message schemas
export const Messages = {
	[MessageType.QUEST_ACTION]: Schemas.Map({
		actionId: Schemas.String
	}),
	[MessageType.QUEST_STATE_REQUEST]: Schemas.Map({}),
	[MessageType.QUEST_STATE_UPDATE]: Schemas.Map({
		currentStep: Schemas.Int,
		collectedVines: Schemas.Int,
		collectedBerries: Schemas.Int,
		collectedKimkim: Schemas.Int,
		hasCatHair: Schemas.Boolean,
		hasChalice: Schemas.Boolean,
		questStarted: Schemas.Boolean
	}),
	[MessageType.QUEST_RESET]: Schemas.Map({})
}

// Register messages and create room
export const room = registerMessages(Messages)

// Quest step enum (matching the original)
export enum StepsEnum {
	not_started = 0,
	talk_octo_1_step = 1,
	catGuy_step = 2,
	talk_octo_2_step = 3,
	collect_herbs = 4,
	talk_octo_3_step = 5,
	calis_step = 6,
	talk_octo_4_step = 7
}

// Quest state interface
export interface QuestState {
	currentStep: StepsEnum
	collectedVines: number
	collectedBerries: number
	collectedKimkim: number
	hasCatHair: boolean
	hasChalice: boolean
	questStarted: boolean
}
