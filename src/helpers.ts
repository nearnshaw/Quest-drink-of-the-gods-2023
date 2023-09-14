import { AudioSource, Transform, engine } from "@dcl/sdk/ecs"
import { Vector3 } from "@dcl/sdk/math"

export function playSound(audio: string, loop: boolean = false, position?: Vector3) {
	const entity = engine.addEntity()
	AudioSource.create(entity, {
		audioClipUrl: audio,
		loop,
		playing: true
	})

	Transform.create(entity, {
		position
	})

	return entity
}


export function getPlayerPosition() {
	return Transform.getOrNull(engine.PlayerEntity)?.position || Vector3.create()
}
