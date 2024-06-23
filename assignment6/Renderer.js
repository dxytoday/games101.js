import { Vector3, MathUtils } from 'three';
import { Ray } from './Ray.js';

function deg2rad(deg) {

	return deg * MathUtils.DEG2RAD;

}

class Renderer {

	frameBuffer = [];

	render(scene, eye_pos, matrix) {

		const frameBuffer = this.frameBuffer;

		const { width, height } = scene;

		const scale = Math.tan(deg2rad(scene.fov * 0.5));
		const imageAspectRatio = width / height;

		let m = 0;

		for (let py = 0; py < height; py++) {

			for (let px = 0; px < width; px++) {

				const x = (2 * ((px + 0.5) / width) - 1) * scale * imageAspectRatio;
				const y = (1 - 2 * ((py + 0.5) / height)) * scale;

				const dir = new Vector3(x, y, -1).normalize();
				dir.applyMatrix4(matrix);

				const ray = new Ray(eye_pos, dir);

				frameBuffer[m++] = scene.castRay(ray, 0);

			}

		}

	}

}

export { Renderer };
