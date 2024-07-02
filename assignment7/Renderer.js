import { Vector3, MathUtils } from '../libs/index.js';
import { Ray } from './Ray.js';
import { Scene } from './Scene.js';
import { Material } from './Material.js';
import { Mesh } from './Mesh.js';

const eye_pos = new Vector3(278, 273, -800);

const scene = new Scene();
const rays = [];

function init(data) {

	// init scene

	const red = new Material(new Vector3(0.63, 0.065, 0.05), new Vector3(0, 0, 0));
	const green = new Material(new Vector3(0.14, 0.45, 0.091), new Vector3(0, 0, 0));
	const white = new Material(new Vector3(0.725, 0.71, 0.68), new Vector3(0, 0, 0));
	const light = new Material(new Vector3(0.65, 0.65, 0.65), new Vector3(47.8348, 38.5664, 31.0808));

	red.roughness = 0.1;
	red.metalness = 0;

	scene.add(new Mesh(data.floor, white));
	scene.add(new Mesh(data.shortbox, white));
	scene.add(new Mesh(data.tallbox, white));
	scene.add(new Mesh(data.left, red));
	scene.add(new Mesh(data.right, green));
	scene.add(new Mesh(data.light, light));

	scene.buildBVH();

	// init rays

	const { width, height } = data;

	const scale = Math.tan(scene.fov * 0.5 * MathUtils.DEG2RAD);
	const imageAspectRatio = width / height;

	for (let py = 0; py < height; py++) {

		for (let px = 0; px < width; px++) {

			const x = (2 * ((px + 0.5) / width) - 1) * scale * imageAspectRatio;
			const y = (1 - 2 * ((py + 0.5) / height)) * scale;

			// 旋转了 180 度
			const direction = new Vector3(-x, y, 1).normalize();

			rays.push(new Ray(eye_pos, direction));

		}

	}

	self.postMessage({ type: 'inited' });

}

function render(spp, start, end) {

	for (let ri = start; ri < end; ri++) {

		const ray = rays[ri];

		const pixel = new Vector3();

		let si = 0;

		for (; si < spp; si++) {

			ray.intersection = false;

			pixel.add(scene.castRay(ray));

			if (!ray.intersection) {

				break;

			}

		}

		self.postMessage({ index: ri, color: pixel.divideScalar(si + 1) });

	}

	self.postMessage({ type: 'finished' });

}

self.onmessage = function ({ data }) {

	if (data.type === 'init') {

		init(data.data);

		return;

	}

	else if (data.type === 'render') {

		const { spp, start, end } = data;

		render(spp, start, end);

	}

}
