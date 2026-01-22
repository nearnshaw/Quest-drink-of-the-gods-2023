import { AudioSource, engine, executeTask, InputAction, pointerEventsSystem } from '@dcl/sdk/ecs'
import { addNPCs } from './npcs'
import { addCollectibles } from './quest_collectibles'
import { setupUi } from './setupUI'
import { Vector3 } from '@dcl/sdk/math'
import { isServer } from '@dcl/sdk/network'
import { initQuestServer } from './server/questManager'
import { initQuestClient } from './client/questClient'
import { resetQuestProgress } from './client/questClient'
import { StepsEnum } from './shared/questMessages'
// Import room to ensure it's registered before main() is called
import './shared/questMessages'



export function main() {
	if (isServer()) {
		// Server-side initialization
		console.log('[SERVER] Initializing server...')
		initQuestServer()
	} else {
		// Client-side initialization
		console.log('[CLIENT] Initializing client...')
		executeTask(async () => {
			await initQuestClient()
		})
	}

	// add NPC characters
	addNPCs()

	// set up quest and NPC UI
	setupUi()

	// add plants and calis
	addCollectibles()

	// add reset button to Hidrant entity (client-side only)
	if (!isServer()) {
		executeTask(async () => {
			// Wait a bit for entities to be loaded
			// await new Promise(resolve => setTimeout(resolve, 1000))
			
			const hidrant = engine.getEntityOrNullByName("Hidrant")
			if (hidrant) {
				pointerEventsSystem.onPointerDown({
					entity: hidrant,
					opts: {
						button: InputAction.IA_PRIMARY,
						hoverText: "Reset Quest Progress"
					}
				}, () => {
					console.log('[CLIENT] Hidrant clicked - resetting quest progress')
					resetQuestProgress()
					AudioSource.playSound(hidrant, 'assets/sounds/grab.mp3', false)
				})
				console.log('[CLIENT] Reset button added to Hidrant entity')
			} else {
				console.log('[CLIENT] Hidrant entity not found')
			}
		})
	}

	// play sounds (client-side only)
	if (!isServer()) {

	}
}

