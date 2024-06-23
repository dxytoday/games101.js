import { Vector3 } from 'three';
import { Light } from './Light.js';
import { Object } from './Object.js';

class Scene {

	width = 0;
	height = 0;

	fov = 90;
	backgroundColor = new Vector3(60, 172, 215);

	maxDepth = 5;
	epsilon = 0.00001;

	objects = [];
	lights = [];

	constructor(width, height) {

		this.width = width;
		this.height = height;

	}

	add(object) {

		if (object instanceof Object) {

			this.objects.push(object);

		}

		if (object instanceof Light) {

			this.lights.push(object);

		}

	}

}

export { Scene };
