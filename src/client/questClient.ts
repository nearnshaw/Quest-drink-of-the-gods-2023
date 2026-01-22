import { isServer } from '@dcl/sdk/network'
import { room, MessageType, StepsEnum, QuestState } from '../shared/questMessages'
import { questProgress } from '../events'
import { updateQuestHUD } from '../setupUI'
import { placeInHand } from '../drink'

let currentQuestState: QuestState = {
	currentStep: StepsEnum.not_started,
	collectedVines: 0,
	collectedBerries: 0,
	collectedKimkim: 0,
	hasCatHair: false,
	hasChalice: false,
	questStarted: false
}

let drinkPlacedInHand = false

export function getQuestState(): QuestState {
	return { ...currentQuestState }
}

export function sendQuestAction(actionId: string) {
	if (isServer()) {
		console.log('[CLIENT] sendQuestAction called on server!')
		return
	}

	console.log(`[CLIENT] Sending quest action: ${actionId}`)
	room.send(MessageType.QUEST_ACTION, { actionId })
}

export function resetQuestProgress() {
	if (isServer()) {
		console.log('[CLIENT] resetQuestProgress called on server!')
		return
	}

	console.log('[CLIENT] Sending quest reset request')
	room.send(MessageType.QUEST_RESET, {})
}

function updateState(newState: QuestState) {
	const oldStep = currentQuestState.currentStep
	currentQuestState = { ...newState }

	// Emit step changes for NPC system
	if (oldStep !== newState.currentStep) {
		questProgress.emit('step', newState.currentStep)
		console.log(`[CLIENT] Quest step changed: ${oldStep} -> ${newState.currentStep}`)
	}

	// Reset flag if quest is no longer complete (e.g., after reset)
	if (newState.currentStep !== StepsEnum.talk_octo_4_step) {
		drinkPlacedInHand = false
	}

	// If quest is complete and we haven't placed the drink yet, place it in hand
	if (newState.currentStep === StepsEnum.talk_octo_4_step && !drinkPlacedInHand) {
		console.log('[CLIENT] Quest complete! Placing drink in hand')
		placeInHand()
		drinkPlacedInHand = true
	}

	// Update HUD
	updateQuestHUD(newState)
}

export async function initQuestClient() {
	if (isServer()) {
		console.error('[CLIENT] Quest client can only run on client!')
		return
	}

	console.log('[CLIENT] Initializing quest client...')

	// Listen for state updates from server
	room.onMessage(MessageType.QUEST_STATE_UPDATE, (data) => {
		console.log('[CLIENT] Received quest state update:', data)
		const newState = {
			currentStep: data.currentStep,
			collectedVines: data.collectedVines,
			collectedBerries: data.collectedBerries,
			collectedKimkim: data.collectedKimkim,
			hasCatHair: data.hasCatHair,
			hasChalice: data.hasChalice,
			questStarted: data.questStarted
		}
		updateState(newState)
	})

	// Request initial state from server
	room.send(MessageType.QUEST_STATE_REQUEST, {})

	console.log('[CLIENT] Quest client initialized')
}
