import { Vector3 } from '../libs/index.js';

const EPSILON = 0.00001;

const usePBR = true;

function F_Schlick(f0, dotVH) {

	const fresnel = Math.pow(2, (-5.55473 * dotVH - 6.98316) * dotVH);

	const result = f0.clone();

	result.multiplyScalar(1.0 - fresnel);
	result.addScalar(fresnel);

	return result;

}

function D_GGX(alpha, dotNH) {

	const a2 = alpha * alpha;

	const denom = (dotNH * dotNH) * (a2 - 1) + 1;

	return 0.3183098861837907 * a2 / (denom * denom);

}

function V_GGX_SmithCorrelated(alpha, dotNL, dotNV) {

	const a2 = alpha * alpha;

	const gv = dotNL * Math.sqrt(a2 + (1.0 - a2) * (dotNV * dotNV));
	const gl = dotNV * Math.sqrt(a2 + (1.0 - a2) * (dotNL * dotNL));

	return 0.5 / Math.max(gv + gl, 1e-6);

}

function BRDF_GGX(L, V, N, f0, roughness) {

	const alpha = roughness * roughness;

	const H = new Vector3().addVectors(L, V).normalize();

	const NoL = Math.max(0, N.dot(L));
	const NoV = Math.max(0, N.dot(V));
	const NoH = Math.max(0, N.dot(H));
	const VoH = Math.max(0, V.dot(H));

	const F = F_Schlick(f0, VoH);
	const D = D_GGX(alpha, NoH);
	const G = V_GGX_SmithCorrelated(alpha, NoL, NoV);

	return F.multiplyScalar(G).multiplyScalar(D);

}

function ImportanceSampleGGX(Xi, N, roughness) {

	const a = roughness * roughness;

	const phi = 2.0 * Math.PI * Xi.x;
	const cosTheta = Math.sqrt((1.0 - Xi.y) / (1.0 + (a * a - 1.0) * Xi.y));
	const sinTheta = Math.sqrt(1.0 - cosTheta * cosTheta);

	const H = new Vector3();
	H.x = Math.cos(phi) * sinTheta;
	H.y = Math.sin(phi) * sinTheta;
	H.z = cosTheta;

	const up = new Vector3();

	if (Math.abs(N.z) < 0.999) {

		up.set(0.0, 0.0, 1.0);

	} else {

		up.set(1.0, 0.0, 0.0);

	}

	const tangent = new Vector3().crossVectors(up, N).normalize();
	const bitangent = new Vector3().crossVectors(N, tangent);

	const sampleVec = new Vector3();
	sampleVec.addScaledVector(tangent, H.x);
	sampleVec.addScaledVector(bitangent, H.y);
	sampleVec.addScaledVector(N, H.z);

	return sampleVec.normalize();

}

function toWorld(a, N) {

	const B = new Vector3();
	const C = new Vector3();

	if (Math.abs(N.x) > Math.abs(N.y)) {

		const invLen = 1.0 / Math.sqrt(N.x * N.x + N.z * N.z);

		C.set(N.z * invLen, 0.0, -N.x * invLen);

	} else {

		const invLen = 1.0 / Math.sqrt(N.y * N.y + N.z * N.z);

		C.set(0.0, N.z * invLen, -N.y * invLen);

	}

	B.crossVectors(C, N);

	const v = new Vector3();
	v.addScaledVector(B, a.x);
	v.addScaledVector(C, a.y);
	v.addScaledVector(N, a.z);

	return v;

}

class Material {

	emmission = undefined;

	Kd = undefined;

	/** 粗糙度 */
	roughness = 1;

	/** 金属度 */
	metalness = 0;

	constructor(Kd, emmission) {

		this.Kd = Kd;

		this.emmission = emmission;

	}

	hasEmission() {

		return this.emmission && this.emmission.length() > EPSILON;

	}

	getEmission() {

		return this.emmission;

	}

	/** brdf */
	eval(wo, wi, N) {

		if (!usePBR) {

			const diffuse = new Vector3();

			diffuse.copy(this.Kd);
			diffuse.divideScalar(Math.PI);

			return diffuse;

		}

		// 微表面材质 - prb

		// 材质的漫反射基础色
		const diffuseColor = this.Kd.clone();

		// 金属没有漫反射，所以漫反射是非金属部分
		diffuseColor.multiplyScalar(1 - this.metalness);

		// 材质的镜面反射基础色，大多数非金属镜面反射是 0.04
		const specularColor = new Vector3(0.04, 0.04, 0.04);

		// 金属的镜面反射是自身颜色，基于金属程度线性插值
		specularColor.lerpVectors(specularColor, this.Kd, this.metalness);

		// 计算 brdf
		// 注意：BRDF 函数使用 GGX 版本，漫反射项忽略 Kd 系数
		// GGX 对比 Cook-Torrance 金属的高光周围有很漂亮的拖尾效果

		// 漫反射率
		const diffuse = diffuseColor.clone().divideScalar(Math.PI);

		// 镜面反射率
		const specular = BRDF_GGX(wi, wo, N, specularColor, this.roughness);

		// brdf 值
		return diffuse.add(specular);

	}

	pdf(wo, wi, N) {

		return 0.5 / Math.PI;

	}

	sample(N) {

		const x_1 = Math.random();
		const x_2 = Math.random();

		const z = Math.abs(1 - 2 * x_1);

		const r = Math.sqrt(1 - z * z);

		const phi = 2 * Math.PI * x_2;

		const localRay = new Vector3(r * Math.cos(phi), r * Math.sin(phi), z);

		return toWorld(localRay, N);

	}

}

export { Material };
