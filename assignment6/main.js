import { Vector3, OBJLoader, Matrix4 } from 'three';
import { View } from 'View';
import { Scene } from './Scene.js';
import { Mesh } from './Mesh.js';
import { Light } from './Light.js';
import { Renderer } from './Renderer.js';

async function main() {

	const view = new View();

	const scene = new Scene(view.width, view.height);

	const loadout = await new OBJLoader().load('./assignment6/resources/bunny.obj');
	const bunny = new Mesh(loadout.position);

	scene.add(bunny);
	scene.add(new Light(new Vector3(-20, 70, 20), 3000));
	scene.add(new Light(new Vector3(20, 70, 20), 3000));
	scene.buildBVH();

	const r = new Renderer();

	let angel = 0;

	const eye_pos_def = new Vector3(-1, 10, 10);
	const eye_target = new Vector3(-3, 6, 0);
	const eye_up = new Vector3(0, 1, 0);

	const matrix = new Matrix4();
	const eye_pos = new Vector3();

	function render(delta) {

		angel = (angel + delta * 45) % 360;

		matrix.makeRotationAxis(eye_up, angel / 180 * Math.PI);

		eye_pos.subVectors(eye_pos_def, eye_target);
		eye_pos.applyMatrix4(matrix);
		eye_pos.add(eye_target);

		matrix.lookAt(eye_pos, eye_target, eye_up);

		r.render(scene, eye_pos, matrix);

		view.fill(r.frameBuffer);

	}

	view.startRenderLoop(render);

}

export { main };
