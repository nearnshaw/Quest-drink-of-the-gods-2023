import { ColliderLayer, Entity, GltfContainer, InputAction, Transform, engine, pointerEventsSystem } from "@dcl/sdk/ecs";
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


export function addCollectibles() {


	// fetch models from Inspector
	const vine1 = engine.getEntityOrNullByName("vine1")
	const vine2 = engine.getEntityOrNullByName("vine2")
	const vine3 = engine.getEntityOrNullByName("vine3")
	const vine4 = engine.getEntityOrNullByName("vine4")
	const vine5 = engine.getEntityOrNullByName("vine5")
	const vine6 = engine.getEntityOrNullByName("vine6")
	const vine7 = engine.getEntityOrNullByName("vine7")
	const vine8 = engine.getEntityOrNullByName("vine8")
	const kimkim1 = engine.getEntityOrNullByName("kimkim1")
	const kimkim2 = engine.getEntityOrNullByName("kimkim2")
	const kimkim3 = engine.getEntityOrNullByName("kimkim3")
	const kimkim4 = engine.getEntityOrNullByName("kimkim4")
	const berry1 = engine.getEntityOrNullByName("berry1")
	const berry2 = engine.getEntityOrNullByName("berry2")
	const berry3 = engine.getEntityOrNullByName("berry3")
	const berry4 = engine.getEntityOrNullByName("berry4")
	const berry5 = engine.getEntityOrNullByName("berry5")
	const berry6 = engine.getEntityOrNullByName("berry6")
	const berry7 = engine.getEntityOrNullByName("berry7")
	const berry8 = engine.getEntityOrNullByName("berry8")
	const berry9 = engine.getEntityOrNullByName("berry9")
	const calis1 = engine.getEntityOrNullByName("calis")
	const calis2 = engine.getEntityOrNullByName("calis2")
	const calis3 = engine.getEntityOrNullByName("calis3")
	const calis4 = engine.getEntityOrNullByName("calis4")
	if (vine1 && vine2 && vine3 && vine4 && vine5 && vine6 && vine7 && vine8 && kimkim1 && kimkim2 && kimkim3 && kimkim4 && berry1 && berry2 && berry3 && berry4 && berry5 && berry6 && berry7 && berry8 && berry9 && calis1 && calis2 && calis3 && calis4) {
		makeQuestCollectible(vine1, "collect_vine_action", true)
		makeQuestCollectible(vine2, "collect_vine_action", true)
		makeQuestCollectible(vine3, "collect_vine_action", true)
		makeQuestCollectible(vine4, "collect_vine_action", true)
		makeQuestCollectible(vine5, "collect_vine_action", true)
		makeQuestCollectible(vine6, "collect_vine_action", true)
		makeQuestCollectible(vine7, "collect_vine_action", true)
		makeQuestCollectible(vine8, "collect_vine_action", true)
		makeQuestCollectible(berry1, "collect_berry_action", true)
		makeQuestCollectible(berry2, "collect_berry_action", true)
		makeQuestCollectible(berry3, "collect_berry_action", true)
		makeQuestCollectible(berry4, "collect_berry_action", true)
		makeQuestCollectible(berry5, "collect_berry_action", true)
		makeQuestCollectible(berry6, "collect_berry_action", true)
		makeQuestCollectible(berry7, "collect_berry_action", true)
		makeQuestCollectible(berry8, "collect_berry_action", true)
		makeQuestCollectible(berry9, "collect_berry_action", true)
		makeQuestCollectible(kimkim1, "collect_kimkim_action", true)
		makeQuestCollectible(kimkim2, "collect_kimkim_action", true)
		makeQuestCollectible(kimkim3, "collect_kimkim_action", true)
		makeQuestCollectible(kimkim4, "collect_kimkim_action", true)
		makeQuestCollectible(calis1, "calis_action", true)
		makeQuestCollectible(calis2, "calis_action", true)
		makeQuestCollectible(calis3, "calis_action", true)
		makeQuestCollectible(calis4, "calis_action", true)
	}

}