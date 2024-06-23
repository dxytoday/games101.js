
const DIFFUSE_AND_GLOSSY = 0;
const REFLECTION_AND_REFRACTION = 1;
const REFLECTION = 2;

class Material {

	m_type = DIFFUSE_AND_GLOSSY;
	m_color = undefined;
	m_emission = undefined;

	ior = 0;
	specularExponent = 0;

	constructor(type, color, emission) {

		this.m_type = type;
		this.m_color = color;
		this.m_emission = emission;

	}

	getType() {

		return this.m_type;

	}

	getColor() {

		return this.m_color;

	}

	getEmission() {

		return this.m_emission;

	}

}

export {

	Material,
	DIFFUSE_AND_GLOSSY,
	REFLECTION_AND_REFRACTION,
	REFLECTION,

};