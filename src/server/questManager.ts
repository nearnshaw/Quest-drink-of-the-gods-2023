import { isServer } from '@dcl/sdk/network'
import { Storage } from '@dcl/sdk/server'
import { room, MessageType, StepsEnum, QuestState } from '../shared/questMessages'

const DEFAULT_STATE: QuestState = {
	currentStep: StepsEnum.not_started,
	collectedVines: 0,
	collectedBerries: 0,
	collectedKimkim: 0,
	hasCatHair: false,
	hasChalice: false,
	questStarted: false
}

// Required counts for completion
const REQUIRED_VINES = 3
const REQUIRED_BERRIES = 3
const REQUIRED_KIMKIM = 3

async function loadQuestState(userId: string): Promise<QuestState> {
	try {
		const stateJson = await Storage.player.get<string>(userId, 'questState')
		if (stateJson) {
			const parsed = JSON.parse(stateJson)
			console.log(`[SERVER][STORAGE] Successfully loaded quest state for player ${userId}`)
			return { ...DEFAULT_STATE, ...parsed }
		} else {
			console.log(`[SERVER][STORAGE] No saved quest state found for player ${userId}, using default state`)
		}
	} catch (error) {
		console.error('[SERVER][ERROR] Failed to load quest state:', error)
	}
	return { ...DEFAULT_STATE }
}

async function saveQuestState(userId: string, state: QuestState): Promise<void> {
	try {
		await Storage.player.set(userId, 'questState', JSON.stringify(state))
		console.log(`[SERVER][STORAGE] Successfully saved quest state for player ${userId}`, {
			step: state.currentStep,
			vines: state.collectedVines,
			berries: state.collectedBerries,
			kimkim: state.collectedKimkim,
			hasCatHair: state.hasCatHair,
			hasChalice: state.hasChalice,
			questStarted: state.questStarted
		})
	} catch (error) {
		console.error('[SERVER][ERROR] Failed to save quest state:', error)
	}
}

function updateStep(state: QuestState): StepsEnum {
	// This function should not auto-advance steps that require player actions (NPC interactions)
	// Action handlers set steps correctly, so we just return the current step
	// Auto-advancement for collection steps (like collect_herbs) is handled in the action handlers
	
	if (!state.questStarted) {
		return StepsEnum.not_started
	}

	// Don't modify steps - let action handlers manage all step transitions
	// This prevents skipping required NPC interactions
	return state.currentStep
}

async function sendStateUpdate(userId: string, state: QuestState) {
	room.send(MessageType.QUEST_STATE_UPDATE, {
		currentStep: state.currentStep,
		collectedVines: state.collectedVines,
		collectedBerries: state.collectedBerries,
		collectedKimkim: state.collectedKimkim,
		hasCatHair: state.hasCatHair,
		hasChalice: state.hasChalice,
		questStarted: state.questStarted
	})
	console.log(`[SERVER][NETWORK] Successfully sent quest state update to player ${userId}`, {
		step: state.currentStep,
		vines: state.collectedVines,
		berries: state.collectedBerries,
		kimkim: state.collectedKimkim,
		hasCatHair: state.hasCatHair,
		hasChalice: state.hasChalice
	})
}

// Track connected players
const connectedPlayers = new Set<string>()

export function initQuestServer() {
	if (!isServer()) {
		console.error('[SERVER] Quest manager can only run on server!')
		return
	}

	console.log('[SERVER] Initializing quest manager...')

	// Handle quest actions from clients
	room.onMessage(MessageType.QUEST_ACTION, async (data, context) => {
		const userId = typeof context?.from === 'string' ? context.from : 'unknown'
		if (userId === 'unknown') {
			console.log('[SERVER] Received action from unknown user')
			return
		}

		console.log(`[SERVER] Player ${userId} performed action: ${data.actionId}`)

		const state = await loadQuestState(userId)
		let stateChanged = false

		switch (data.actionId) {
			case 'talk_octo_1_action':
				if (!state.questStarted) {
					state.questStarted = true
					state.currentStep = StepsEnum.talk_octo_1_step
					stateChanged = true
					console.log(`[SERVER] Player ${userId} started the quest`)
				}
				break

			case 'talk_catguy_action':
				if (state.currentStep >= StepsEnum.talk_octo_1_step && state.currentStep < StepsEnum.catGuy_step) {
					state.currentStep = StepsEnum.catGuy_step
					stateChanged = true
					console.log(`[SERVER] Player ${userId} talked to cat guy`)
				}
				break

			case 'get_hair_action':
				if (state.currentStep >= StepsEnum.catGuy_step && !state.hasCatHair) {
					state.hasCatHair = true
					stateChanged = true
					console.log(`[SERVER] Player ${userId} collected cat hair`)
				}
				break

			case 'talk_octo_2_action':
				if (state.hasCatHair && state.currentStep >= StepsEnum.catGuy_step) {
					state.currentStep = StepsEnum.talk_octo_2_step
					stateChanged = true
					console.log(`[SERVER] Player ${userId} brought cat hair to octopus`)
				}
				break

			case 'collect_vine_action':
				if (state.currentStep >= StepsEnum.talk_octo_2_step && state.collectedVines < REQUIRED_VINES) {
					state.collectedVines++
					stateChanged = true
					console.log(`[SERVER] Player ${userId} collected vine (${state.collectedVines}/${REQUIRED_VINES})`)
					// Auto-advance to collect_herbs step when all herbs are collected
					const hasAllHerbsNow =
						state.collectedVines >= REQUIRED_VINES &&
						state.collectedBerries >= REQUIRED_BERRIES &&
						state.collectedKimkim >= REQUIRED_KIMKIM
					if (hasAllHerbsNow && state.currentStep < StepsEnum.collect_herbs) {
						state.currentStep = StepsEnum.collect_herbs
					}
				}
				break

			case 'collect_berry_action':
				if (state.currentStep >= StepsEnum.talk_octo_2_step && state.collectedBerries < REQUIRED_BERRIES) {
					state.collectedBerries++
					stateChanged = true
					console.log(`[SERVER] Player ${userId} collected berry (${state.collectedBerries}/${REQUIRED_BERRIES})`)
					// Auto-advance to collect_herbs step when all herbs are collected
					const hasAllHerbsNow =
						state.collectedVines >= REQUIRED_VINES &&
						state.collectedBerries >= REQUIRED_BERRIES &&
						state.collectedKimkim >= REQUIRED_KIMKIM
					if (hasAllHerbsNow && state.currentStep < StepsEnum.collect_herbs) {
						state.currentStep = StepsEnum.collect_herbs
					}
				}
				break

			case 'collect_kimkim_action':
				if (state.currentStep >= StepsEnum.talk_octo_2_step && state.collectedKimkim < REQUIRED_KIMKIM) {
					state.collectedKimkim++
					stateChanged = true
					console.log(`[SERVER] Player ${userId} collected kimkim (${state.collectedKimkim}/${REQUIRED_KIMKIM})`)
					// Auto-advance to collect_herbs step when all herbs are collected
					const hasAllHerbsNow =
						state.collectedVines >= REQUIRED_VINES &&
						state.collectedBerries >= REQUIRED_BERRIES &&
						state.collectedKimkim >= REQUIRED_KIMKIM
					if (hasAllHerbsNow && state.currentStep < StepsEnum.collect_herbs) {
						state.currentStep = StepsEnum.collect_herbs
					}
				}
				break

			case 'talk_octo_3_action':
				const hasAllHerbs =
					state.collectedVines >= REQUIRED_VINES &&
					state.collectedBerries >= REQUIRED_BERRIES &&
					state.collectedKimkim >= REQUIRED_KIMKIM
				if (hasAllHerbs && state.currentStep >= StepsEnum.talk_octo_2_step) {
					state.currentStep = StepsEnum.talk_octo_3_step
					stateChanged = true
					console.log(`[SERVER] Player ${userId} brought herbs to octopus`)
				}
				break

			case 'calis_action':
				if (state.currentStep >= StepsEnum.talk_octo_3_step && !state.hasChalice) {
					state.hasChalice = true
					stateChanged = true
					console.log(`[SERVER] Player ${userId} collected chalice`)
					// Auto-advance step when chalice is collected
					if (state.currentStep === StepsEnum.talk_octo_3_step) {
						state.currentStep = StepsEnum.calis_step
					}
				}
				break

			case 'talk_octo_4_action':
				if (state.hasChalice && state.currentStep >= StepsEnum.calis_step) {
					state.currentStep = StepsEnum.talk_octo_4_step
					stateChanged = true
					console.log(`[SERVER] Player ${userId} completed the quest!`)
				}
				break

			default:
				console.log(`[SERVER] Unknown action: ${data.actionId}`)
		}

		// Update step based on current progress
		const newStep = updateStep(state)
		if (newStep !== state.currentStep) {
			state.currentStep = newStep
			stateChanged = true
		}

		if (stateChanged) {
			console.log(`[SERVER] Quest state changed for player ${userId}, saving and broadcasting update`)
			await saveQuestState(userId, state)
			await sendStateUpdate(userId, state)
		} else {
			// Still send update even if nothing changed (for client sync)
			console.log(`[SERVER] No state change for player ${userId}, sending sync update`)
			await sendStateUpdate(userId, state)
		}
	})

	// Handle state requests from clients
	room.onMessage(MessageType.QUEST_STATE_REQUEST, async (data, context) => {
		const userId = typeof context?.from === 'string' ? context.from : 'unknown'
		if (userId === 'unknown') {
			console.log('[SERVER] State request from unknown user')
			return
		}

		// Track new player connections
		const isNewPlayer = !connectedPlayers.has(userId)
		if (isNewPlayer) {
			connectedPlayers.add(userId)
			console.log(`[SERVER] New player ${userId} connected`)
		}

		console.log(`[SERVER] Player ${userId} requested quest state`)
		const state = await loadQuestState(userId)
		await sendStateUpdate(userId, state)
	})

	// Handle quest reset requests from clients
	room.onMessage(MessageType.QUEST_RESET, async (data, context) => {
		const userId = typeof context?.from === 'string' ? context.from : 'unknown'
		if (userId === 'unknown') {
			console.log('[SERVER] Reset request from unknown user')
			return
		}

		console.log(`[SERVER] Player ${userId} requested quest reset`)
		
		// Reset to default state
		const resetState = { ...DEFAULT_STATE }
		await saveQuestState(userId, resetState)
		await sendStateUpdate(userId, resetState)
		
		console.log(`[SERVER] Quest progress reset for player ${userId}`)
	})

	// Room ready callback - players will request state when they connect
	room.onReady(() => {
		console.log('[SERVER] Room is ready for connections')
		console.log(`[SERVER] Currently tracking ${connectedPlayers.size} connected player(s)`)
	})

	console.log('[SERVER] Quest manager initialized')
}
