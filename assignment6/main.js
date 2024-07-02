import { Vector3, OBJLoader, OrbitControls } from 'three';
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

	const camera = new OrbitControls(view.canvas, new Vector3(-1, 10, 10), new Vector3(-3, 6, 0));

	function render() {

		if (!camera.changed) {

			return;

		}

		camera.changed = false;

		scene.enablePathTracing = !camera.start;

		r.render(scene, camera.position, camera.matrix);

		view.fill(r.frameBuffer);

	}

	view.startRenderLoop(render);

}

export { main };
