import { ColliderLayer, engine, Entity, executeTask, GltfContainer, InputAction, inputSystem, Material, MeshCollider, pointerEventsSystem, TextAlignMode, TextShape, Transform } from '@dcl/sdk/ecs'

import * as utils from '@dcl-sdk/utils'
import { addNPCs } from './npcs'
import { createQuestsClient, QuestInstance } from '@dcl/quests-client'
import { startEvent, actionEvents, questProgress } from './events'
import { addCollectibles, makeQuestCollectible } from './quest_collectibles'
import { hud, setupUi } from './setupUI'
import { createQuestHUD, QuestUI } from '@dcl/quests-client/dist/hud'
import { placeInHand } from './drink'
import { Action } from '@dcl/quests-client/dist/protocol/decentraland/quests/definitions.gen'
import { Vector3 } from '@dcl/sdk/math'


const serviceUrl = 'wss://quests-rpc.decentraland.org'
const QUEST_ID = 'df110232-01d7-4946-9582-66e3ef53170c'

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



export function main() {

	executeTask(async () => {


		try {
			const questsClient = await createQuestsClient(serviceUrl, QUEST_ID)
			console.log('Quests Client is ready to use!')

			// update in case player had already stated quest
			const currentProgress = questsClient.getQuestInstance()
			if (currentProgress) {
				console.log("QUEST WAS ALREADY STARTED ", currentProgress)
				updateInternalState(currentProgress)
				hud.upsert(currentProgress)
			}

			// update when player makes progress
			questsClient.onUpdate((questInstance) => {
				console.log("QUEST UPDATE ARRIVED ", questInstance)
				updateInternalState(questInstance)
				hud.upsert(questInstance)
			})


			// check if already started, if not then start
			startEvent.on('start', async () => {
				console.log("quest stated: CALLING START QUEST")
				const instances = questsClient.getInstances()
				let found: boolean = false
				instances.forEach((quest) => {
					if (quest.id === QUEST_ID) {
						found = true
					}
				}
				)
				console.log("quest: WAS ID FOUND? ", found)

				if (!found) {
					await questsClient.startQuest()
				}
			})

			// react to the start of your Quest
			questsClient.onStarted((quest: QuestInstance) => {
				hud.upsert(quest)
			})

			// forward completed actions to server
			actionEvents.on('action', async (action: Action) => {
				console.log("SENDING QUEST ACTION TO SERVER, ", action)
				await questsClient.sendEvent({ action })
			})


		} catch (e) {
			console.error('Error on connecting to Quests Service')
		}
	})


	// add NPC characters
	addNPCs()

	// set up quest and NPC UI
	setupUi()

	// add plants and calis
	addCollectibles()


	// play sounds
	utils.playSound("assets/sounds/medieval-town.mp3", true, Vector3.create(86, 1, 110))
	utils.playSound("assets/sounds/water.mp3", true, Vector3.create(200, 1, 177))

}



function updateInternalState(questInstance: QuestInstance) {
	if (questInstance.quest.id === QUEST_ID) {
		for (let step of questInstance.state.stepsCompleted) {
			switch (step) {
				case "talk_octo_1_step":
					questProgress.emit("step", StepsEnum.talk_octo_1_step)
					break
				case "catGuy_step":
					questProgress.emit("step", StepsEnum.catGuy_step)
					break
				case "talk_octo_2_step":
					questProgress.emit("step", StepsEnum.talk_octo_2_step)
					break
				case "collect_herbs":
					questProgress.emit("step", StepsEnum.collect_herbs)
					break
				case "talk_octo_3_step":
					questProgress.emit("step", StepsEnum.talk_octo_3_step)
					break
				case "calis_step":
					questProgress.emit("step", StepsEnum.calis_step)
					break
				case "talk_octo_4_step":
					questProgress.emit("step", StepsEnum.talk_octo_4_step)
					break
			}
		}
	}
}

