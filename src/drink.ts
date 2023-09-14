import { AvatarAnchorPointType, AvatarAttach, AvatarModifierArea, CameraMode, CameraModeArea, CameraType, GltfContainer, InputAction, PointerEventType, Transform, engine, inputSystem } from "@dcl/sdk/ecs";
import { Quaternion, Vector3 } from "@dcl/sdk/math";
import { getPlayerPosition, playSound } from "./helpers";

export function placeInHand() {

	const calisParent = engine.addEntity()
	AvatarAttach.create(calisParent, {
		anchorPointId: AvatarAnchorPointType.AAPT_NAME_TAG
	})

	const calis = engine.addEntity()
	Transform.create(calis, {
		position: Vector3.create(0, -0.80, 0.4),
		rotation: Quaternion.fromEulerDegrees(0, 145, 0),
		parent: calisParent
	})
	GltfContainer.create(calis, {
		src: "assets/models/calisFull.glb"
	})


	const camearaModifier = engine.addEntity()
	AvatarAttach.create(camearaModifier)

	CameraModeArea.create(camearaModifier, {
		area: Vector3.create(10, 10, 10),
		mode: CameraType.CT_FIRST_PERSON,
	})

	engine.addSystem(() => {
		if (inputSystem.isTriggered(InputAction.IA_SECONDARY, PointerEventType.PET_DOWN)) {
			// Logic in response to button F press
			playSound('assets/sounds/swallow.mp3', false, getPlayerPosition())
		}
	})
}