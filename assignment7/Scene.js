import { Vector3 } from '../libs/index.js';
import { BVHAccel } from './BVHAccel.js';
import { Ray } from './Ray.js';

class Scene {

	fov = 40;
	backgroundColor = new Vector3(0, 0, 0);

	objects = [];

	bvh = undefined;

	russianRoulette = 0.8;

	add(object) {

		this.objects.push(object);

	}

	buildBVH() {

		this.bvh = new BVHAccel(this.objects);

	}

	intersect(ray) {

		return this.bvh.intersect(ray);

	}

	sampleLight() {

		let emit_area_sum = 0;

		for (const eachObject of this.objects) {

			if (eachObject.hasEmission()) {

				emit_area_sum += eachObject.getArea();

			}

		}

		const p = emit_area_sum * Math.random();
		emit_area_sum = 0;

		for (const eachObject of this.objects) {

			if (eachObject.hasEmission()) {

				emit_area_sum += eachObject.getArea();

				if (p <= emit_area_sum) {

					return eachObject.areaSampling();

				}

			}

		}

	}

	direct(ray, intersection) {

		const color = new Vector3();

		const hitPoint = intersection.coords;
		const normal = intersection.normal;

		const lightSample = this.sampleLight();	// 采样面积光
		const lightPoint = lightSample.coords;

		const lightDistance = hitPoint.distanceTo(lightPoint);

		const lightDir = new Vector3().subVectors(lightPoint, hitPoint).normalize();
		const lightRay = new Ray(hitPoint, lightDir);

		// 往光源方向投射
		const lightIntersection = this.intersect(lightRay);

		if (!lightIntersection) {

			return color;

		}

		if ((lightIntersection.distance - lightDistance) <= -0.001) {

			return color;

		}

		// 反射率 brdf

		const material = intersection.material;

		const wo = ray.direction.clone().negate();
		const wi = lightDir;
		const N = normal;

		const brdf = material.eval(wo, wi, N);

		// 辐照度 Irradiance

		const emmission = lightSample.emmission;

		const pdf = lightSample.pdf;

		const lightNormal = lightSample.normal;
		const light2Point = lightDir.clone().negate();

		const attenuation = lightDistance * lightDistance;

		color.copy(emmission);
		color.multiplyScalar(Math.max(0, lightNormal.dot(light2Point)));
		color.divideScalar(attenuation);
		color.divideScalar(pdf);

		// 辐射率 Radiance

		color.multiply(brdf);
		color.multiplyScalar(Math.max(0, normal.dot(lightDir)));

		return color;

	}

	indirect(directRay, directIntersection) {

		const color = new Vector3();

		const prr = Math.random(); // prr = probability RussianRoulette

		if (prr > this.russianRoulette) {

			return color;

		}

		const hitPoint = directIntersection.coords;

		const directMaterial = directIntersection.material;
		const directNormal = directIntersection.normal;

		const indirectDirection = directMaterial.sample(directNormal);

		const indirectRay = new Ray(hitPoint, indirectDirection);
		const indirectIntersection = this.intersect(indirectRay);

		if (!indirectIntersection) {

			return color;

		}

		const indirectMaterial = indirectIntersection.material;

		if (indirectMaterial.hasEmission()) {

			return color;

		}

		const wo = directRay.direction.clone().negate();
		const wi = indirectDirection;
		const N = directNormal;

		const pdf = directMaterial.pdf(wo, wi, N);

		// 辐照度 Irradiance

		const emmission = this.castRay(indirectRay);
		emmission.divideScalar(pdf);

		// 反射率 brdf

		const brdf = indirectMaterial.eval(wo, wi, N);

		// 辐射率 Radiance

		color.copy(emmission);
		color.multiply(brdf);
		color.multiplyScalar(Math.max(0, directNormal.dot(indirectDirection)));
		color.divideScalar(this.russianRoulette);

		return color;

	}

	castRay(ray) {

		const intersection = this.intersect(ray);

		if (!intersection) {

			return this.backgroundColor.clone();

		}

		if (intersection.material.hasEmission()) {

			return intersection.material.getEmission().clone();

		}

		ray.intersection = true;

		// 直接光照
		const directColor = this.direct(ray, intersection);

		// 间接光照
		const indirectColor = this.indirect(ray, intersection);

		return directColor.add(indirectColor);

	}

}

export { Scene };
