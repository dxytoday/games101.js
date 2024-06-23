import { Vector3, Vector2, Matrix4 } from 'three';
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
	sph1.diffuseColor.set(153, 179, 204);

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

	let angel = 90;

	const eye_pos_def = new Vector3(0, 4, 0);
	const eye_target = new Vector3(0, -3, -11);
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
