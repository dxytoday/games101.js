import * as THREE from '../math/three.js';
import { Ray } from './Ray.js';

class hit_payload {

	tNear = Infinity;
	index;
	hit_obj;
	uv = new THREE.Vector2();
	normal = new THREE.Vector3();

}

function refract(I, N, ior) {

	const result = new THREE.Vector3(0, 0, 0);

	let cosi = THREE.MathUtils.clamp(I.dot(N), -1, 1);

	let etai = 1;
	let etat = ior;

	const n = N.clone();

	if (cosi < 0) {

		cosi = -cosi;

	} else {

		etai = ior;
		etat = 1;

		n.negate();

	}

	const eta = etai / etat;
	const k = 1 - eta * eta * (1 - cosi * cosi);

	if (k >= 0) {

		result.addScaledVector(I, eta);
		result.addScaledVector(n, eta * cosi - Math.sqrt(k));

	}

	return result;
}

function fresnel(I, N, ior) {

	let cosi = THREE.MathUtils.clamp(I.dot(N), -1, 1);

	let etai = 1;
	let etat = ior;

	if (cosi > 0) {

		etai = ior;
		etat = 1;

	}

	const sint = etai / etat * Math.sqrt(Math.max(0, 1 - cosi * cosi));

	if (sint >= 1) {

		return 1;

	}

	const cost = Math.sqrt(Math.max(0, 1 - sint * sint));

	cosi = Math.abs(cosi);

	const Rs = ((etat * cosi) - (etai * cost)) / ((etat * cosi) + (etai * cost));
	const Rp = ((etai * cosi) - (etat * cost)) / ((etai * cosi) + (etat * cost));

	return (Rs * Rs + Rp * Rp) / 2;

}

function trace(origin, direction, objects) {

	const payload = new hit_payload();

	for (const object of objects) {

		object.intersect(origin, direction, payload);

	}

	return payload;

}

export class Renderer {

	frameBuffer = [];

	render(scene) {

		const { width, height } = scene;

		const scale = Math.tan(THREE.MathUtils.DEG2RAD * scene.fov * 0.5);
		const aspect = width / height;

		const eye_pos = new THREE.Vector3(278, 273, -800);

		const spp = 16;

		let index = 0;

		for (let py = 0; py < height; py++) {

			for (let px = 0; px < width; px++) {

				console.log(px, py);

				const x = (2 * ((px + 0.5) / width) - 1) * scale * aspect;
				const y = (1 - 2 * ((py + 0.5) / height)) * scale;

				const direction = new THREE.Vector3(-x, y, 1).normalize(); // 绕 y 轴旋转 -PI

				const ray = new Ray(eye_pos, direction);

				const pixel = new THREE.Vector3();

				for (let ii = 0; ii < spp; ii++) {

					const color = scene.castRay(ray);

					pixel.addScaledVector(color, 1 / spp);

				}

				this.frameBuffer[index++] = pixel;

			}

		}

	}

}