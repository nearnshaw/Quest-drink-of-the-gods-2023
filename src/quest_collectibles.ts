import { ColliderLayer, Entity, GltfContainer, InputAction, Transform, pointerEventsSystem } from "@dcl/sdk/ecs";
import { actionEvents } from './events'
import * as utils from '@dcl-sdk/utils'
import { Vector3 } from "@dcl/sdk/math";

export function makeQuestCollectible(entity: Entity, questId: string, addCollider?: boolean) {

	pointerEventsSystem.onPointerDown({
		entity: entity, opts: {
			button: InputAction.IA_PRIMARY, hoverText: "Collect"
		}
	}, () => {
		actionEvents.emit('action', {
			type: 'CUSTOM',
			parameters: { id: questId },
		})
		const currentScale = Transform.get(entity).scale
		utils.tweens.startScaling(entity, currentScale, Vector3.Zero(), 0.5, utils.InterpolationType.EASEOUTEBOUNCE)
	})

	if (addCollider) {
		const mutableGLTF = GltfContainer.getMutable(entity)
		mutableGLTF.invisibleMeshesCollisionMask = undefined
		mutableGLTF.visibleMeshesCollisionMask = ColliderLayer.CL_POINTER
	}

}