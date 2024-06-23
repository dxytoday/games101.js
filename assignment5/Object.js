import { Vector3 } from 'three';

const DIFFUSE_AND_GLOSSY = 0;
const REFLECTION_AND_REFRACTION = 1;
const REFLECTION = 2;

class Object {

	materialType = DIFFUSE_AND_GLOSSY;

	/** 折射率 */
	ior = 1.3;

	/** 漫反射颜色 */
	diffuseColor = new Vector3(51, 51, 51);

	// 高光指数
	specularExponent = 128;

}

export {

	Object,
	DIFFUSE_AND_GLOSSY,
	REFLECTION_AND_REFRACTION,
	REFLECTION,

};
