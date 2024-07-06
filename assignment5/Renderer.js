import { Vector3, MathUtils } from 'three';
import { DIFFUSE_AND_GLOSSY, REFLECTION_AND_REFRACTION, REFLECTION } from './Object.js';

class hit_payload {

	tNear;
	index;
	hit_obj;
	uv;

}

function deg2rad(deg) {

	return deg * MathUtils.DEG2RAD;

}

function reflect(I, N) {

	const vector = N.clone();
	vector.multiplyScalar(2 * I.dot(N));

	return vector.subVectors(I, vector);

}

function refract(I, N, ior) {

	const result = new Vector3(0, 0, 0);

	let cosi = MathUtils.clamp(I.dot(N), -1, 1);

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

	let cosi = MathUtils.clamp(I.dot(N), -1, 1);

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

	let tNear = Infinity;
	let payload;

	for (const object of objects) {

		const intersection = object.intersect(origin, direction);

		if (intersection && intersection.tNearK < tNear) {

			payload = new hit_payload();

			payload.hit_obj = object;
			payload.tNear = intersection.tNearK;
			payload.index = intersection.index;
			payload.uv = intersection.uvK;

			tNear = intersection.tNearK;

		}

	}

	return payload;

}

class Renderer {

	frameBuffer = [];

	enablePathTracing = true;

	render(scene, eye_pos, eye_matrix) {

		const { width, height } = scene;

		const scale = Math.tan(deg2rad(scene.fov * 0.5));
		const imageAspectRatio = width / height;

		let m = 0;

		for (let py = 0; py < height; py++) {

			for (let px = 0; px < width; px++) {

				let x;
				let y;

				const dir = new Vector3(x, y, -1).normalize();
				dir.applyMatrix4(eye_matrix);

				this.frameBuffer[m++] = this.castRay(eye_pos, dir, scene, 0);

			}

		}

	}

	castRay(orig, dir, scene, depth) {

		if (depth > scene.maxDepth) {

			return new Vector3();

		}

		const payload = trace(orig, dir, scene.objects);

		if (!payload) {

			return scene.backgroundColor.clone();

		}

		const hitPoint = orig.clone().addScaledVector(dir, payload.tNear);
		const hitObject = payload.hit_obj;

		const { N, st } = hitObject.getSurfaceProperties(hitPoint, payload);
		const hitColor = hitObject.evalDiffuseColor(st);

		if (!this.enablePathTracing) {

			return hitColor;

		}

		if (hitObject.materialType === REFLECTION_AND_REFRACTION) {

			const directColor = new Vector3();

			{

				let ks = 0;

				const epsilonDir = Math.sign(dir.dot(N)) * -1 * scene.epsilon;
				const shadowPointOrig = hitPoint.clone().addScaledVector(N, epsilonDir);

				for (const light of scene.lights) {

					const lightDir = light.position.clone().sub(hitPoint);

					const distance = lightDir.length();

					lightDir.normalize();

					const shadow_res = trace(shadowPointOrig, lightDir, scene.objects);

					const inShadow = shadow_res && shadow_res.tNear < distance;

					if (!inShadow) {

						const V = new Vector3();
						const L = new Vector3();
						const H = new Vector3();

						V.copy(dir).negate().normalize();
						L.copy(lightDir);
						H.addVectors(V, L).normalize();

						const NoH = Math.max(0, N.dot(H));
						const intensity = light.intensity / (distance * distance);
						ks += intensity * Math.pow(NoH, hitObject.specularExponent);

					}

				}

				directColor.addScaledVector(hitColor, ks);

			}

			// reflection

			const reflectionDirection = reflect(dir, N).normalize();

			const reflectionEpsilonDir = Math.sign(reflectionDirection.dot(N)) * scene.epsilon;
			const reflectionRayOrig = hitPoint.clone().addScaledVector(N, reflectionEpsilonDir);

			const reflectionColor = this.castRay(reflectionRayOrig, reflectionDirection, scene, depth + 1);

			// refraction

			const refractionDirection = refract(dir, N, hitObject.ior).normalize();

			const refractionEpsilonDir = Math.sign(refractionDirection.dot(N)) * scene.epsilon;
			const refractionRayOrig = hitPoint.clone().addScaledVector(N, refractionEpsilonDir);

			const refractionColor = this.castRay(refractionRayOrig, refractionDirection, scene, depth + 1);

			// blend

			const kr = fresnel(dir, N, hitObject.ior);

			hitColor.copy(directColor);
			hitColor.addScaledVector(reflectionColor, kr);
			hitColor.addScaledVector(refractionColor, 1 - kr);

		}

		else if (hitObject.materialType === REFLECTION) {

			const directColor = new Vector3();

			{

				let kd = 0;
				let ks = 0;

				const epsilonDir = Math.sign(dir.dot(N)) * -1 * scene.epsilon;
				const shadowPointOrig = hitPoint.clone().addScaledVector(N, epsilonDir);

				for (const light of scene.lights) {

					const lightDir = light.position.clone().sub(hitPoint);

					const distance = lightDir.length();

					lightDir.normalize();

					const shadow_res = trace(shadowPointOrig, lightDir, scene.objects);

					const inShadow = shadow_res && shadow_res.tNear < distance;

					if (!inShadow) {

						const V = new Vector3();
						const L = new Vector3();
						const H = new Vector3();

						V.copy(dir).negate().normalize();
						L.copy(lightDir);
						H.addVectors(V, L).normalize();

						const NoL = Math.max(0, N.dot(L));
						const NoH = Math.max(0, N.dot(H));

						const intensity = light.intensity / (distance * distance);

						kd += intensity * NoL;
						ks += intensity * Math.pow(NoH, hitObject.specularExponent);

					}

				}

				directColor.addScaledVector(hitColor, kd);
				directColor.addScaledVector(hitColor, ks);

			}

			const indirectColor = new Vector3();

			{

				const reflectionDirection = reflect(dir, N).normalize();

				const epsilonDir = Math.sign(reflectionDirection.dot(N)) * scene.epsilon;
				const reflectionRayOrig = hitPoint.clone().addScaledVector(N, epsilonDir);

				const reflectionColor = this.castRay(reflectionRayOrig, reflectionDirection, scene, depth + 1);

				indirectColor.copy(reflectionColor);

			}

			hitColor.addVectors(directColor, indirectColor);

		}

		else if (hitObject.materialType === DIFFUSE_AND_GLOSSY) {

			let kd = 0;
			let ks = 0;

			const epsilonDir = Math.sign(dir.dot(N)) * -1 * scene.epsilon;
			const shadowPointOrig = hitPoint.clone().addScaledVector(N, epsilonDir);

			for (const light of scene.lights) {

				const lightDir = light.position.clone().sub(hitPoint);

				const distance = lightDir.length();

				lightDir.normalize();

				const shadow_res = trace(shadowPointOrig, lightDir, scene.objects);

				const inShadow = shadow_res && shadow_res.tNear < distance;

				if (!inShadow) {

					const V = new Vector3();
					const L = new Vector3();
					const H = new Vector3();

					V.copy(dir).negate().normalize();
					L.copy(lightDir);
					H.addVectors(V, L).normalize();

					const NoL = Math.max(0, N.dot(L));
					const NoH = Math.max(0, N.dot(H));

					const intensity = light.intensity / (distance * distance);

					kd += intensity * NoL;
					ks += intensity * Math.pow(NoH, hitObject.specularExponent);

				}

			}

			const diffuseColor = hitColor.clone();

			hitColor.set(0, 0, 0);
			hitColor.addScaledVector(diffuseColor, kd);
			hitColor.addScaledVector(diffuseColor, ks);

		}

		return hitColor;

	}

}

export { Renderer };
