import { engine, executeTask, InputAction, inputSystem, Material, MeshCollider, pointerEventsSystem, TextAlignMode, TextShape } from '@dcl/sdk/ecs'

import { bounceScalingSystem, circularSystem } from './systems'


import { addNPCs } from './npcs'
import { Action, createQuestsClient, QuestInstance } from '@dcl/quests-client'
import { startEvent, actionEvents, questProgress } from './events'
import { makeQuestCollectible } from './quest_collectibles'

// Defining behavior. See `src/systems.ts` file.
engine.addSystem(circularSystem)
engine.addSystem(bounceScalingSystem)


const serviceUrl = 'wss://quests-rpc.decentraland.zone'
const QUEST_ID = 'THE_DRINK_OF_THE_GODS'


export function main() {
	// draw UI
	//setupUi()

	executeTask(async () => {


		try {
			const questsClient = await createQuestsClient(serviceUrl)
			console.log('Quests Client is ready to use!')

			questsClient.onUpdate((quest: QuestInstance) => {
				for (let step of quest.state.stepsCompleted) {
					switch (step) {
						case "talk_octo_1_step":
							questProgress.emit("step", 1)
						case "catGuy_step":
							questProgress.emit("step", 2)
						case "talk_octo_2_step":
							questProgress.emit("step", 3)
						case "collect_herbs":
							questProgress.emit("step", 4)
						case "talk_octo_3_step":
							questProgress.emit("step", 5)
						case "calis_step":
							questProgress.emit("step", 6)
						case "talk_octo_4_step":
							questProgress.emit("step", 7)
					}
				}

				// update your state here or react to your quest updates
			})

			questsClient.onStarted((quest: QuestInstance) => {
				// react to the start of your Quest
			})

			startEvent.on('start', async () => {
				await questsClient.startQuest({ questId: QUEST_ID })
			})

			actionEvents.on('action', async (action: Action) => {
				await questsClient.sendEvent({ action })
			})


		} catch (e) {
			console.error('Error on connecting to Quests Service')
		}
	})



	addNPCs()



	// fetch models from Inspector
	const vine1 = engine.getEntityOrNullByName("vine1")
	const vine2 = engine.getEntityOrNullByName("vine2")
	const vine3 = engine.getEntityOrNullByName("vine3")
	const vine4 = engine.getEntityOrNullByName("vine4")
	const kimkim1 = engine.getEntityOrNullByName("kimkim1")
	const kimkim2 = engine.getEntityOrNullByName("kimkim2")
	const kimkim3 = engine.getEntityOrNullByName("kimkim3")
	const kimkim4 = engine.getEntityOrNullByName("kimkim4")
	const berry1 = engine.getEntityOrNullByName("berry1")
	const berry2 = engine.getEntityOrNullByName("berry2")
	const berry3 = engine.getEntityOrNullByName("berry3")
	const berry4 = engine.getEntityOrNullByName("berry4")
	const calis = engine.getEntityOrNullByName("calis")
	if (vine1 && vine2 && vine3 && vine4 && kimkim1 && kimkim2 && kimkim3 && kimkim4 && berry1 && berry2 && berry3 && berry4 && calis) {
		makeQuestCollectible(vine1, "collect_vine_action", true)
		makeQuestCollectible(vine2, "collect_vine_action", true)
		makeQuestCollectible(vine3, "collect_vine_action", true)
		makeQuestCollectible(vine4, "collect_vine_action", true)
		makeQuestCollectible(berry1, "collect_berry_action", true)
		makeQuestCollectible(berry2, "collect_berry_action", true)
		makeQuestCollectible(berry3, "collect_berry_action", true)
		makeQuestCollectible(berry4, "collect_berry_action", true)
		makeQuestCollectible(kimkim1, "collect_kimkim_action", true)
		makeQuestCollectible(kimkim2, "collect_kimkim_action", true)
		makeQuestCollectible(kimkim3, "collect_kimkim_action", true)
		makeQuestCollectible(kimkim4, "collect_kimkim_action", true)
		makeQuestCollectible(calis, "calis_action", true)
	}




	// fetch cube from Inspector
	const cat = engine.getEntityOrNullByName("Cat")
	if (cat) {

	}


}
