import { Vector3, Vector2, OrbitControls } from 'three';
import { View } from 'View';
import { Scene } from './Scene.js';
import { Sphere } from './Sphere.js';
import { Mesh } from './Mesh.js';
import { Light } from './Light.js';
import { Renderer } from './Renderer.js';
import { DIFFUSE_AND_GLOSSY, REFLECTION_AND_REFRACTION, REFLECTION } from './Object.js';

function main() {

	const view = new View();

	const scene = new Scene(view.width, view.height);

	const sph1 = new Sphere(new Vector3(-1, 0, -12), 2);
	sph1.materialType = REFLECTION;
	sph1.diffuseColor.set(0.6, 0.7, 0.8);

	const sph2 = new Sphere(new Vector3(0.5, -0.5, -8), 1.5);
	sph2.ior = 1.5;
	sph2.materialType = REFLECTION_AND_REFRACTION;

	scene.add(sph1);
	scene.add(sph2);

	const verts = [new Vector3(-5, -3, -6), new Vector3(5, -3, -6), new Vector3(5, -3, -16), new Vector3(-5, -3, -16)];
	const vertIndex = [new Vector3(0, 1, 3), new Vector3(1, 2, 3)];
	const st = [new Vector2(0, 0), new Vector2(1, 0), new Vector2(1, 1), new Vector2(0, 1)];
	const mesh = new Mesh(verts, vertIndex, 2, st);
	mesh.materialType = DIFFUSE_AND_GLOSSY;

	scene.add(mesh);
	scene.add(new Light(new Vector3(-20, 70, 20), 3000));
	scene.add(new Light(new Vector3(30, 50, -12), 3000));

	const r = new Renderer();

	const camera = new OrbitControls(view.canvas, new Vector3(0, 4, 0), new Vector3(0, -3, -11));

	function render() {

		if (!camera.changed) {

			return;

		}

		camera.changed = false;

		r.enablePathTracing = !camera.start;

		r.render(scene, camera.position, camera.matrix);

		view.fill(r.frameBuffer);

	}

	view.startRenderLoop(render);

}

export { main };
