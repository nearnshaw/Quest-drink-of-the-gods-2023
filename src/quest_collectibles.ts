import { AudioSource, ColliderLayer, Entity, GltfContainer, InputAction, Transform, engine, pointerEventsSystem } from "@dcl/sdk/ecs";
import * as utils from '@dcl-sdk/utils'
import { Vector3 } from "@dcl/sdk/math";
import { sendQuestAction } from './client/questClient';

export function makeQuestCollectible(entity: Entity, questId: string, addCollider?: boolean) {

	pointerEventsSystem.onPointerDown({
		entity: entity, opts: {
			button: InputAction.IA_PRIMARY, hoverText: "Collect"
		}
	}, () => {
		sendQuestAction(questId)
		const currentScale = Transform.get(entity).scale
		utils.tweens.startScaling(entity, currentScale, Vector3.Zero(), 0.5, utils.InterpolationType.EASEOUTEBOUNCE)
		AudioSource.create(entity)
		AudioSource.playSound(entity, 'assets/sounds/grab.mp3', true)
	})

	if (addCollider) {
		const mutableGLTF = GltfContainer.getMutable(entity)
		mutableGLTF.invisibleMeshesCollisionMask = undefined
		mutableGLTF.visibleMeshesCollisionMask = ColliderLayer.CL_POINTER
	}

}


export function addCollectibles() {
	// Fetch entities by tag and set up collectibles
	const vineEntities = engine.getEntitiesByTag("Vine")
	for (const entity of vineEntities) {
		makeQuestCollectible(entity, "collect_vine_action", true)
	}

	const berryEntities = engine.getEntitiesByTag("Berry")
	for (const entity of berryEntities) {
		makeQuestCollectible(entity, "collect_berry_action", true)
	}

	const kimkimEntities = engine.getEntitiesByTag("Kimkim")
	for (const entity of kimkimEntities) {
		makeQuestCollectible(entity, "collect_kimkim_action", true)
	}

	const calisEntities = engine.getEntitiesByTag("Calis")
	for (const entity of calisEntities) {
		makeQuestCollectible(entity, "calis_action", true)
	}
}