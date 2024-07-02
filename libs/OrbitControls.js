import { Spherical } from './Spherical.js';
import { Vector2 } from './Vector2.js';
import { Vector3 } from './Vector3.js';
import { Matrix4 } from './Matrix4.js';

class OrbitControls {

	constructor(

		domElement,
		position = new Vector3(0, 0, 0),
		target = new Vector3(0, 0, -1),

	) {

		const scope = this;

		scope.position = position;
		scope.target = target;
		scope.matrix = new Matrix4();

		scope.changed = true;
		scope.start = false;

		scope.onChanged = function () { };

		domElement.style.touchAction = 'none';

		const up = new Vector3(0, 1, 0);
		const offset = new Vector3();

		const spherical = new Spherical();
		const sphericalDelta = new Spherical();

		const rotateStart = new Vector2();
		const rotateEnd = new Vector2();
		const rotateDelta = new Vector2();

		const pointers = [];
		const pointerPositions = {};

		function rotateLeft(angle) {

			sphericalDelta.theta -= angle;

			update();

		}

		function rotateUp(angle) {

			sphericalDelta.phi -= angle;

			update();

		}

		function handleMouseDownRotate(event) {

			rotateStart.set(event.clientX, event.clientY);

		}

		function handleMouseMoveRotate(event) {

			rotateEnd.set(event.clientX, event.clientY);

			rotateDelta.subVectors(rotateEnd, rotateStart);

			const element = domElement;

			rotateLeft(2 * Math.PI * rotateDelta.x / element.clientHeight); // yes, height

			rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight);

			rotateStart.copy(rotateEnd);

			update();

		}

		function handleTouchStartRotate() {

			if (pointers.length === 1) {

				rotateStart.set(pointers[0].pageX, pointers[0].pageY);

			} else {

				const x = 0.5 * (pointers[0].pageX + pointers[1].pageX);
				const y = 0.5 * (pointers[0].pageY + pointers[1].pageY);

				rotateStart.set(x, y);

			}

		}

		function handleTouchMoveRotate(event) {

			if (pointers.length == 1) {

				rotateEnd.set(event.pageX, event.pageY);

			} else {

				const position = getSecondPointerPosition(event);

				const x = 0.5 * (event.pageX + position.x);
				const y = 0.5 * (event.pageY + position.y);

				rotateEnd.set(x, y);

			}

			rotateDelta.subVectors(rotateEnd, rotateStart);

			const element = domElement;

			rotateLeft(2 * Math.PI * rotateDelta.x / element.clientHeight); // yes, height

			rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight);

			rotateStart.copy(rotateEnd);

		}

		function onPointerDown(event) {

			scope.start = true;

			if (pointers.length === 0) {

				domElement.setPointerCapture(event.pointerId);

				domElement.addEventListener('pointermove', onPointerMove);
				domElement.addEventListener('pointerup', onPointerUp);

			}

			addPointer(event);

			if (event.pointerType === 'touch') {

				onTouchStart(event);

			} else {

				onMouseDown(event);

			}

		}

		function onPointerMove(event) {

			if (event.pointerType === 'touch') {

				onTouchMove(event);

			} else {

				onMouseMove(event);

			}

		}

		function onPointerUp(event) {

			removePointer(event);

			if (pointers.length === 0) {

				domElement.releasePointerCapture(event.pointerId);

				domElement.removeEventListener('pointermove', onPointerMove);
				domElement.removeEventListener('pointerup', onPointerUp);

				scope.start = false;
				scope.changed = true;

				scope.onChanged();

			}

		}

		function onMouseDown(event) {

			handleMouseDownRotate(event);

		}

		function onMouseMove(event) {

			handleMouseMoveRotate(event);

		}

		function onTouchStart(event) {

			trackPointer(event);

			handleTouchStartRotate();

		}

		function onTouchMove(event) {

			trackPointer(event);

			handleTouchMoveRotate(event);

		}

		function onContextMenu(event) {

			event.preventDefault();

		}

		function addPointer(event) {

			pointers.push(event);

		}

		function removePointer(event) {

			delete pointerPositions[event.pointerId];

			for (let i = 0; i < pointers.length; i++) {

				if (pointers[i].pointerId == event.pointerId) {

					pointers.splice(i, 1);
					return;

				}

			}

		}

		function trackPointer(event) {

			let position = pointerPositions[event.pointerId];

			if (position === undefined) {

				position = new Vector2();
				pointerPositions[event.pointerId] = position;

			}

			position.set(event.pageX, event.pageY);

		}

		function getSecondPointerPosition(event) {

			const pointer = (event.pointerId === pointers[0].pointerId) ? pointers[1] : pointers[0];

			return pointerPositions[pointer.pointerId];

		}

		domElement.addEventListener('contextmenu', onContextMenu);
		domElement.addEventListener('pointerdown', onPointerDown);
		domElement.addEventListener('pointercancel', onPointerUp);

		function update() {

			offset.copy(scope.position).sub(scope.target);

			spherical.setFromVector3(offset);

			spherical.theta += sphericalDelta.theta;
			spherical.phi += sphericalDelta.phi;

			spherical.makeSafe();

			offset.setFromSpherical(spherical);

			scope.position.copy(scope.target).add(offset);

			scope.matrix.lookAt(scope.position, scope.target, up);

			sphericalDelta.set(0, 0, 0);

			scope.changed = true;

		}

		update();

	}

}

export { OrbitControls };
