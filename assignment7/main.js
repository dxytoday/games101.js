import * as THREE from '../math/three.js';
import { Material, MaterialType } from './Material.js';
import { Scene } from './Scene.js';
import { Mesh } from './Mesh.js';
import { OBJLoader } from './OBJLoader.js';
import { Renderer } from './Renderer.js';

export default async function main(width, height, showBuffer) {

	const scene = new Scene(width, height);

	const red = new Material(MaterialType.DIFFUSE, new THREE.Vector3(0, 0, 0));
	red.Kd = new THREE.Vector3(0.63, 0.065, 0.05);

	const green = new Material(MaterialType.DIFFUSE, new THREE.Vector3(0, 0, 0));
	green.Kd = new THREE.Vector3(0.14, 0.45, 0.091);

	const white = new Material(MaterialType.DIFFUSE, new THREE.Vector3(0, 0, 0));
	white.Kd = new THREE.Vector3(0.725, 0.71, 0.68);

	const le = new THREE.Vector3();
	le.addScaledVector(new THREE.Vector3(0.747 + 0.058, 0.747 + 0.258, 0.747), 8.0);
	le.addScaledVector(new THREE.Vector3(0.740 + 0.287, 0.740 + 0.160, 0.740), 15.6);
	le.addScaledVector(new THREE.Vector3(0.737 + 0.642, 0.737 + 0.159, 0.737), 18.4);

	const light_m = new Material(MaterialType.DIFFUSE, le);
	light_m.Kd = new THREE.Vector3().setScalar(0.65);

	const floor_obj = await OBJLoader.load('./resources/floor.obj');
	const floor = new Mesh(floor_obj.positions, white);
	scene.addObject(floor);

	const shortbox_obj = await OBJLoader.load('./resources/shortbox.obj');
	const shortbox = new Mesh(shortbox_obj.positions, white);
	scene.addObject(shortbox);

	const tallbox_obj = await OBJLoader.load('./resources/tallbox.obj');
	const tallbox = new Mesh(tallbox_obj.positions, white);
	scene.addObject(tallbox);

	const left_obj = await OBJLoader.load('./resources/left.obj');
	const left = new Mesh(left_obj.positions, red);
	scene.addObject(left);

	const right_obj = await OBJLoader.load('./resources/right.obj');
	const right = new Mesh(right_obj.positions, green);
	scene.addObject(right);

	const light_obj = await OBJLoader.load('./resources/light.obj');
	const light = new Mesh(light_obj.positions, light_m);
	scene.addObject(light);

	scene.buildBVH();

	const r = new Renderer();
	r.render(scene);

	showBuffer(r.frameBuffer);

}
