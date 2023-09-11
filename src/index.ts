import { ColliderLayer, engine, executeTask, GltfContainer, InputAction, inputSystem, Material, MeshCollider, pointerEventsSystem, TextAlignMode, TextShape } from '@dcl/sdk/ecs'


import { addNPCs } from './npcs'
import { Action, createQuestsClient, QuestInstance } from '@dcl/quests-client'
import { startEvent, actionEvents, questProgress } from './events'
import { makeQuestCollectible } from './quest_collectibles'
import { hud, setupUi } from './setupUI'
import { createQuestHUD, QuestUI } from '@dcl/quests-client/dist/hud'


const serviceUrl = 'wss://quests-rpc.decentraland.zone'
const QUEST_ID = '2838b81c-7096-449f-b8f9-c6ebe696c774'

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

			questsClient.onUpdate((quest) => {
				console.log("QUEST UPDATE ARRIVED ", quest)
				if (quest.quest.id === QUEST_ID) {
					for (let step of quest.state.stepsCompleted) {
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
				hud.upsert(quest)
				// update your state here or react to your quest updates
			})

			questsClient.onStarted((quest: QuestInstance) => {
				hud.upsert(quest)
				// react to the start of your Quest
			})


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

			actionEvents.on('action', async (action: Action) => {
				console.log("SENDING QUEST ACTION TO SERVER, ", action)
				await questsClient.sendEvent({ action })
			})


		} catch (e) {
			console.error('Error on connecting to Quests Service')
		}
	})

	addNPCs()

	setupUi()


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

}

function generateQuestUI(questInstance: QuestInstance): QuestUI {
	const steps: QuestUI['steps'] = []
	const nextSteps = []
	if (questInstance.quest.definition?.steps) {
		for (const step of questInstance.quest.definition?.steps) {
			if (questInstance.state.currentSteps[step.id]) {
				const content = questInstance.state.currentSteps[step.id]
				const newTasks = step.tasks.map((task) => {
					return {
						description: task.description,
						done: !!content.tasksCompleted.find((t) => t.id == task.id)
					}
				})
				steps.push({ name: step.description, tasks: newTasks })
				nextSteps.push(
					...questInstance.quest.definition?.connections
						.filter((conn) => conn.stepFrom === step.id)
						.map(
							(conn) => questInstance.quest.definition?.steps.find((step) => step.id === conn.stepTo)?.description || ''
						)
				)
			}
		}
	}
	const ui = { name: questInstance.quest.name, steps, nextSteps }
	return ui
}