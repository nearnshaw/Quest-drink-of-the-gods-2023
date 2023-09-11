import { Animator, ColliderLayer, InputAction, MeshCollider, PointerEvents, Transform } from "@dcl/sdk/ecs";
import { GltfContainer } from "@dcl/sdk/ecs";
import { pointerEventsSystem } from "@dcl/sdk/ecs";
import { engine } from "@dcl/sdk/ecs";
import { Quaternion } from "@dcl/sdk/math";
import { Vector3 } from "@dcl/sdk/math";
import { startEvent, actionEvents, questProgress } from './events'
import * as utils from '@dcl-sdk/utils'
import { StepsEnum } from ".";

export let catIsOut: boolean = false

export function spawnCat() {

	if (catIsOut) return
	catIsOut = true

	const initialPosition = Vector3.create(65.8, 0, 74.08)
	const initialRotation = Quaternion.fromEulerDegrees(0, -26.92, 0)
	const endPosition = Vector3.add(initialPosition, Vector3.rotate(Vector3.Forward(), initialRotation))

	const cat = engine.addEntity()
	Transform.create(cat, {
		position: initialPosition,
		rotation: initialRotation,
		scale: Vector3.create(0.77, 0.77, 0.77)

	})

	GltfContainer.create(cat, {
		src: "assets/models/NPCs/cat_orange.glb",
		visibleMeshesCollisionMask: ColliderLayer.CL_POINTER
	})

	MeshCollider.setBox(cat)

	pointerEventsSystem.onPointerDown({
		entity: cat,
		opts: {
			button: InputAction.IA_PRIMARY,
			hoverText: "Pick hair"
		}
	}, () => {
		actionEvents.emit('action', {
			type: 'CUSTOM',
			parameters: { id: 'get_hair_action' },
		})

	})

	utils.tweens.startTranslation(cat, initialPosition, endPosition, 2, utils.InterpolationType.LINEAR, () => {

		Animator.stopAllAnimations(cat)
		Animator.playSingleAnimation(cat, "IdleNorm")
	})

	Animator.create(cat, {
		states: [
			{
				clip: "WalkCycle",
				name: "WalkCycle",
				loop: true,
				playing: true
			}, {
				clip: "IdleNorm",
				name: "IdleNorm",
				loop: true,
				playing: true
			}

		]
	})

	questProgress.on("step", (stepNumber: number) => {

		if (!catIsOut) return
		// remove click from cat
		if (stepNumber == StepsEnum.catGuy_step) {
			PointerEvents.deleteFrom(cat)
		}
	})


}