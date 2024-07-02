
/** 射线交集对象 */
class Intersection {

	coords = undefined;
	normal = undefined;
	mesh = undefined;
	object = undefined;
	material = undefined;

	distance = Infinity;

}

/** 面积光源采样对象 */
class Sample {

	coords = undefined;
	normal = undefined;
	emmission = undefined;
	pdf = 0;

}

export { Intersection, Sample };
