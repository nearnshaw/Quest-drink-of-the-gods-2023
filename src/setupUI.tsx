import ReactEcs, { Label, ReactEcsRenderer, UiEntity } from '@dcl/sdk/react-ecs'
import { isServer } from '@dcl/sdk/network'
import { NpcUtilsUi } from 'dcl-npc-toolkit'
import { QuestState, StepsEnum } from './shared/questMessages'

let currentQuestState: QuestState | null = null

export function updateQuestHUD(state: QuestState) {
	currentQuestState = state
}

const QuestHUD = () => {
	if (!currentQuestState || !currentQuestState.questStarted) {
		return null
	}

	const getCurrentTask = () => {
		const vines = currentQuestState!.collectedVines
		const berries = currentQuestState!.collectedBerries
		const kimkim = currentQuestState!.collectedKimkim
		const step = currentQuestState!.currentStep
		
		// Show the NEXT step the player needs to complete, not the current one
		switch (step) {
			case StepsEnum.not_started:
				return 'Talk to the Octopus Barman'
			case StepsEnum.talk_octo_1_step:
				return 'Talk to the Cat Guy'
			case StepsEnum.catGuy_step:
				if (currentQuestState!.hasCatHair) {
					return 'Bring cat hair to the Octopus'
				}
				return 'Get cat hair from the cat'
			case StepsEnum.talk_octo_2_step:
				if (vines < 3 || berries < 3 || kimkim < 3) {
					return `Collect ingredients: Vines ${vines}/3, Berries ${berries}/3, Kimkim ${kimkim}/3`
				}
				return 'Bring herbs to the Octopus'
			case StepsEnum.collect_herbs:
				return 'Bring herbs to the Octopus'
			case StepsEnum.talk_octo_3_step:
				if (currentQuestState!.hasChalice) {
					return 'Bring chalice to the Octopus'
				}
				return 'Find a golden Chalice'
			case StepsEnum.calis_step:
				return 'Bring chalice to the Octopus'
			case StepsEnum.talk_octo_4_step:
				return 'Quest Complete!'
			default:
				return 'Start the quest by talking to the Octopus'
		}
	}

	return (
		<UiEntity
			uiTransform={{
				width: '280px',
				height: 'auto',
				positionType: 'absolute',
				position: { right: '20px', top: '50%' },
				padding: { top: 8, bottom: 8, left: 10, right: 10 }
			}}
			uiBackground={{
				color: { r: 0, g: 0, b: 0, a: 0.8 }
			}}
		>
			<Label
				value="Quest: The Drink of the Gods"
				fontSize={14}
				color={{ r: 1, g: 1, b: 1, a: 1 }}
				uiTransform={{
					margin: { bottom: 4 }
				}}
			/>
			<Label
				value={getCurrentTask()}
				fontSize={12}
				color={{ r: 0.8, g: 0.8, b: 0.8, a: 1 }}
			/>
		</UiEntity>
	)
}

const SceneOwnedUi = () => {
	// UI should only render on client side
	if (isServer()) {
		return null
	}

	return [
		NpcUtilsUi(),
		<QuestHUD key="quest-hud" />
	]
}

export function setupUi() {
	// Only set up UI on client side
	if (!isServer()) {
		ReactEcsRenderer.setUiRenderer(SceneOwnedUi)
	}
}

