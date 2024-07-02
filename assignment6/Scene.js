import { Vector3 } from 'three';
import { Mesh } from './Mesh.js';
import { Light } from './Light.js';
import { BVHAccel } from './BVHAccel.js';
import { Ray } from './Ray.js';

class Scene {

	width = 0;
	height = 0;

	fov = 90;
	backgroundColor = new Vector3(0.235294, 0.67451, 0.843137);

	maxDepth = 5;
	epsilon = 0.00001;

	objects = [];
	lights = [];

	bvh = undefined;

	enablePathTracing = true;

	constructor(width, height) {

		this.width = width;
		this.height = height;

	}

	add(object) {

		if (object instanceof Mesh) {

			this.objects.push(object);

		}

		if (object instanceof Light) {

			this.lights.push(object);

		}

	}

	buildBVH() {

		this.bvh = new BVHAccel(this.objects);

	}

	intersect(ray) {

		return this.bvh.intersect(ray);

	}

	castRay(ray, depth) {

		if (depth > this.maxDepth) {

			return this.backgroundColor.clone();

		}

		const intersection = this.intersect(ray);

		if (!intersection) {

			return this.backgroundColor.clone();

		}

		const hitPoint = intersection.coords;
		const material = intersection.material;
		const N = intersection.normal;

		const diffuseColor = material.getColor().clone();

		if (!this.enablePathTracing) {

			return diffuseColor;

		}

		// DIFFUSE_AND_GLOSSY 

		let kd = 0;
		let ks = 0;

		const epsilonDir = Math.sign(ray.direction.dot(N)) * -1 * this.epsilon;
		const shadowPointOrig = hitPoint.clone().addScaledVector(N, epsilonDir);

		for (const light of this.lights) {

			const lightDir = light.position.clone().sub(hitPoint);

			const distance = lightDir.length();

			lightDir.normalize();

			const shadow_res = this.intersect(new Ray(shadowPointOrig, lightDir));

			const inShadow = shadow_res && shadow_res.distance < distance;

			if (!inShadow) {

				const V = new Vector3();
				const L = new Vector3();
				const H = new Vector3();

				V.copy(ray.direction).negate().normalize();
				L.copy(lightDir);
				H.addVectors(V, L).normalize();

				const NoL = Math.max(0, N.dot(L));
				const NoH = Math.max(0, N.dot(H));

				const intensity = light.intensity / (distance * distance);

				kd += intensity * NoL;
				ks += intensity * Math.pow(NoH, material.specularExponent);

			}

		}

		const color = new Vector3();
		color.addScaledVector(diffuseColor, kd);
		color.addScaledVector(diffuseColor, ks);

		return color;

	}

}

export { Scene };
