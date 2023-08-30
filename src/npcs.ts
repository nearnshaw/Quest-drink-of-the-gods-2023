
import { Entity, engine } from '@dcl/sdk/ecs';
import { Quaternion, Vector3 } from '@dcl/sdk/math';
import *  as  npc from 'dcl-npc-toolkit'
import { startEvent, actionEvents, questProgress } from './events'
import { spawnCat } from './cat';

let octo: Entity
let catGuy: Entity

let catIsOut: boolean = false

export let octoState = 0

export function addNPCs() {

	questProgress.on("step", (stepNumber: number) => {
		octoState = stepNumber

		if (catIsOut && stepNumber == 2) {
			npc.playAnimation(catGuy, `collect`)
		}
	})

	octo = npc.create(
		{ position: Vector3.create(79.28, 0, 135.34), rotation: Quaternion.fromEulerDegrees(0, -90, 0) },
		//NPC Data Object
		{
			type: npc.NPCType.CUSTOM,
			model: 'assets/models/NPCs/BobOctorossV46.glb',
			onActivate: () => {

				switch (octoState) {
					case 0:
						npc.talk(octo, OctoQuest, 'questQ')
						break
					case 1:
						npc.talk(octo, OctoQuest, 'noHairs')
						break
					case 2:
						npc.talk(octo, OctoQuest, 'quest2')
						break
					case 3:
						npc.talk(octo, OctoQuest, 'noHerbs')
						break
					case 4:
						npc.talk(octo, OctoQuest, 'quest3')
						break
					case 5:
						npc.talk(octo, OctoQuest, 'noCalis')
						break
					case 6:
						npc.talk(octo, OctoQuest, 'serveDrink')
						break
				}

				npc.talk(octo, OctoQuest, 'questQ')
				console.log('npc activated');
				npc.changeIdleAnim(octo, 'TalkLoop')
				npc.playAnimation(octo, 'TalkIntro', true, 0.63)
			},
			portrait: `images/portraits/bartender.png`,
			dialogSound: `sounds/navigationForward.mp3`,
			idleAnim: 'Idle',
			faceUser: false,
			onWalkAway: () => {
				backToIdle()
			},
		}
	)

	catGuy = npc.create(
		{ position: Vector3.create(65.53, 0.11, 74.18), rotation: Quaternion.fromEulerDegrees(0, -90, 0) },
		//NPC Data Object
		{
			type: npc.NPCType.CUSTOM,
			model: 'assets/models/NPCs/cat_guySittedV12.glb',
			reactDistance: 9,
			idleAnim: `idle`,
			faceUser: false,
			dialogSound: `sounds/navigationForward.mp3`,
			onActivate: () => {
				console.log('npc activated');
				switch (octoState) {
					case 1:
						npc.talk(catGuy, catQuest)
						npc.playAnimation(catGuy, `talk`)
						break
				}
			},
			onWalkAway: () => {
				npc.playAnimation(catGuy, `idle`)
			}
		}
	)



}

export function backToIdle() {
	npc.changeIdleAnim(octo, 'Idle')
	npc.playAnimation(octo, 'TalkOutro', true, 0.63)
}

export function releaseCat() {



}


export let catQuest: npc.Dialog[] = [
	{
		text: `Hey there! Let me introduce myself. I’m the cat guy`,
		skipable: true,
	},
	{
		text: `That’s what everyone calls me. Or well, my cats don’t call me anything really, I wish they did. But if people other than my cats were to hang out with me, that’s what they’d call me for sure.`,
		skipable: true,
	},
	{
		text: "Oh so you're also into that weird fad of drinking cat hairs, huh?",
		skipable: true,
	},
	{
		text: "Pretty strange if you ask me. Then they say I'm the freak just because I eat cat food.",
		skipable: true,
		triggeredByNext: () => {

			actionEvents.emit('action', {
				type: 'CUSTOM',
				parameters: { id: 'talk_catguy_action' },
			})

			if (!catIsOut) {
				catIsOut = true
				spawnCat()
			}
		},
	},
	{
		text: "Well, if you really want to go forward with that... here's whiskers. You can pinch some of his hairs and be done with it.",
		skipable: true,
		isEndOfDialog: true,
	},
	{
		name: 'collect',
		text: 'Be gentle, you weirdo!',
		skipable: true,
		isEndOfDialog: true,
	},
]


export let OctoQuest: npc.Dialog[] = [
	{
		name: 'questQ',
		text: '',
		skipable: true,
	},
	{
		text: "There's an item that's not on our menu, but if you're willing to fetch the ingredients I can make it for you",
		skipable: true,
	},
	{
		text: `A drink so amazing, it's been called <color="red">The drink of the gods</color> by... well by some drunk that tried it. Do you want me to make it for you?`,
		isQuestion: true,
		buttons: [
			{
				label: 'YES',
				goToDialog: 'quest1',
				triggeredActions: () => {
					startEvent.emit("start")
					//arrow.move(catGuy, new Vector3(0, 0, 0), new Vector3(0, 1.5, 0))
					//arrow.show()
				},
			},
			{ label: 'NO', goToDialog: 'end' },
		],
	},
	{
		name: 'end',
		text: 'Oh well, if for any reason you need a hand and/or tentacle, I’ll be here!',
		triggeredByNext: () => {
			console.log('ended conversation')
			backToIdle()
		},
		isEndOfDialog: true,
	},
	{
		name: 'quest1',
		text: "Alright! This is a rich herbal concoction, so I'm going to need some exotic spices from a few places.",

		skipable: true,
	},
	{
		text: `But let's start with the most unusual and controversial ingredient in the list, this one really puts the drink together, you'll see!`,
		skipable: true,
	},
	{
		text: `We need to make an infusion with just a few <color="red">cat hairs</color>. Sounds weird, right? But it gives it that extra oomph. If you're allergic, even better!`,
		skipable: true,
	},
	{
		text: `I'm sure you can get some cat hairs from the <color="red">Cat Guy</color>. He's somewhere here in the village. Last time I saw him he in the stable.`,
		skipable: true,
	},
	{
		text: `Let's start with that. Bring me some cat hairs first so I can get that infusion going, and then I'll tell you what I need next.`,

		skipable: true,
		triggeredByNext: () => {
			actionEvents.emit('action', {
				type: 'CUSTOM',
				parameters: { id: 'talk_octo_1_step' },
			})
			//updateQuests()
			backToIdle()
		},
		isEndOfDialog: true,
	},

	{
		name: 'quest2',
		text: `Great! Those hairs are nice and scruffy, you'll taste them for sure! Let's get down to the rest of the ingredients.`,
		skipable: true,
		// triggeredByNext: () => {
		// arrow.hide()
		// },
	},
	{
		name: 'ingredients',
		text: 'We start with some sweet <color="red">sugar berries</color>.',
		skipable: true,
		image: {
			path: 'images/quest/berryThumb.png',
			offsetY: 20,
			offsetX: -20,
			section: { sourceHeight: 512, sourceWidth: 512 },
		},
	},
	{
		text: 'This plant tends to grow near water, so look out for the shores of the river.',
		skipable: true,
		image: {
			path: 'images/quest/berryThumb.png',
			offsetY: 20,
			offsetX: -20,
			section: { sourceHeight: 512, sourceWidth: 512 },
		},
	},
	{
		text: 'We balance that out with some acidity from some <color="red">kim-kim</color>',
		skipable: true,
		image: {
			path: 'images/quest/kimkimThumb.png',
			offsetY: 10,
			offsetX: -25,
			section: { sourceHeight: 512, sourceWidth: 512 },
		},
	},
	{
		text: 'This plant only grows in absolute darkness, so look for it deep in the caverns behind the castle.',
		skipable: true,
		image: {
			path: 'images/quest/kimkimThumb.png',
			offsetY: 10,
			offsetX: -25,
			section: { sourceHeight: 512, sourceWidth: 512 },
		},
	},
	{
		text: 'And finally add some smoky notes from a <color="red">dried leather vine</color>.',
		skipable: true,
		image: {
			path: 'images/quest/vineThumb.png',
			offsetY: 15,
			offsetX: -20,
			section: { sourceHeight: 512, sourceWidth: 512 },
		},
	},
	{
		text: 'This plant grows best near human settlements. It probably has to do with the manure from the farm animals... the less you know the better, really.',
		skipable: true,
		image: {
			path: 'images/quest/vineThumb.png',
			offsetY: 15,
			offsetX: -20,
			section: { sourceHeight: 512, sourceWidth: 512 },
		},
	},
	{
		text: `Bring me those and then I'll tell you what's next in the list. You can ask me to go over those ingredients again any time.`,

		skipable: true,
		triggeredByNext: () => {
			backToIdle()

			actionEvents.emit('action', {
				type: 'CUSTOM',
				parameters: { id: 'talk_octo_2_step' },
			})
			//updateQuests()
		},
		isEndOfDialog: true,
	},

	{
		name: 'quest3',
		text: `Super, all of these ingredients you collected smell super fresh.`,
		// triggeredByNext: () => {
		//  arrow.hide()
		// },
		skipable: true,
	},
	{
		text: `We can't just serve that in any regular glass. I'm going to need a special <color="red">Chalice</color> for that. Look for the chaman in <color="red">Gamer Plaza</color>, 80,0, he'll know.`,
		skipable: true,
	},
	{
		text: "When you have that ready, come back to me and I'll make you the drink. It's going to be worth it, I promise!",
		triggeredByNext: () => {
			actionEvents.emit('action', {
				type: 'CUSTOM',
				parameters: { id: 'talk_octo_3_step' },
			})
			//updateQuests()

			backToIdle()
		},

		isEndOfDialog: true,
	},

	{
		name: 'noHerbs',
		text: "Looks like we're still missing some ingredients. If you bring them all, I can make you the drink!",
		skipable: true,
		triggeredByNext: () => {
			backToIdle()
		},
	},
	{
		text: 'Do you want me to go over the list of ingredients again?',
		isQuestion: true,
		buttons: [
			{
				label: 'YES',
				goToDialog: 'ingredients',
			},
			{ label: 'NO', goToDialog: 'end' },
		],
	},

	{
		name: 'noHairs',
		text: "We're still missing the key ingredient, the cat hairs! I refuse to do this without following the recipe to the letter. Look for the cat guy, he's sitting somewhere south of here in this same plaza.",
		skipable: true,
		triggeredByNext: () => {
			backToIdle()
		},
		isEndOfDialog: true,
	},
	{
		name: 'noCalis',
		text: "We have all the ingredients, but we wouldn't do the drink justice if we just served it in a regular glass. Go to the Chaman on Gamer Plaza, he'll know where you can get something worthy of it.",
		skipable: true,
		triggeredByNext: () => {
			backToIdle()
		},
		isEndOfDialog: true,
	},
	{
		name: 'makeDrink',
		text: 'Amazing, you found everything! Time to do my magic',
		triggeredByNext: () => {
			// arrow.hide()
			npc.playAnimation(octo, 'CalisPrep', true, 7.17)

			//octo.getComponent(NPCTriggerComponent).onCameraExit = () => { }
			// prepareOctoTrip()
			//utils.setTimeout(7250, () => {
			//   octopus.talk(OctoQuest, 'serveDrink')
			//   Calis1.pickup(() => {
			//     setStreamVolume(0.5)
			//   })
			// })
		},
		isEndOfDialog: true,
	},
	{
		name: 'serveDrink',
		text: `Here you go. Enjoy it, it's not every day that you can get to taste of such a rare elixir. \nHit <color="red">F</color> to drink up!`,
		triggeredByNext: () => {
			actionEvents.emit('action', {
				type: 'CUSTOM',
				parameters: { id: 'talk_octo_4_step' },
			})
			//updateQuests()
			//octoTrip()
		},
		isEndOfDialog: true,
	},
]