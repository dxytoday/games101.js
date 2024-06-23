import { Bounds3 } from "./Bounds3.js";

class BVHBuildNode {

	bounds;
	left;
	right;
	object;

	count = 0;

	splitAxis = 0;
	firstPrimOffset = 0;
	nPrimitives = 0;

};

class BVHAccel {

	maxPrimsInNode = 1;

	/** [ Triangle | Mesh ] */
	primitives = undefined;

	/** BVHBuildNode */
	root = undefined;

	constructor(objects) {

		this.primitives = objects;

		this.root = recursiveBuild(objects);

	}

	intersect(ray) {

		if (!this.root) {

			return;

		}

		return this.getIntersection(this.root, ray);

	}

	getIntersection(node, ray) {

		const dirIsNeg = [

			ray.direction.x > 0,
			ray.direction.y > 0,
			ray.direction.z > 0,

		];

		if (!node.bounds.intersectP(ray, ray.direction_inv, dirIsNeg)) {

			return;

		}

		if (!node.left && !node.right) {

			return node.object.getIntersection(ray);

		}

		const h1 = this.getIntersection(node.left, ray);
		const h2 = this.getIntersection(node.right, ray);

		if (!h1 && !h2) {

			return;

		}

		if (!h1) return h2;

		if (!h2) return h1;

		return h1.distance < h2.distance ? h1 : h2;

	}

}

/** objects = [ Triangle | Mesh ] */
function recursiveBuild(objects) {

	const node = new BVHBuildNode();

	const bounds = new Bounds3();

	// 并集所有对象
	for (const object of objects) {

		bounds.union(object.getBounds());

	}

	if (objects.length === 1) {

		node.object = objects[0];
		node.bounds = bounds;
		node.count = 1;

		return node;

	}

	else if (objects.length === 2) {

		const leftObjects = objects.slice(0, 1);
		const rightObjects = objects.slice(1, 2);

		node.left = recursiveBuild(leftObjects);
		node.right = recursiveBuild(rightObjects);

		node.bounds = bounds;
		node.count = 2;

		return node;

	}

	else {

		const centroidBounds = bounds.makeEmpty();

		for (const object of objects) {

			centroidBounds.expandByPoint(object.getBounds().centroid())

		}

		const dim = centroidBounds.maxExtent();

		switch (dim) {

			case 0:

				objects.sort((a, b) => a.getBounds().centroid().x - b.getBounds().centroid().x);

				break;

			case 1:

				objects.sort((a, b) => a.getBounds().centroid().y - b.getBounds().centroid().y);

				break;

			case 2:

				objects.sort((a, b) => a.getBounds().centroid().z - b.getBounds().centroid().z);

				break;

		}

		const middling = Math.ceil(objects.length / 2);

		const leftshapes = objects.slice(0, middling);
		const rightshapes = objects.slice(middling, objects.length);

		node.left = recursiveBuild(leftshapes);
		node.right = recursiveBuild(rightshapes);

		bounds.makeEmpty();
		bounds.union(node.left.bounds);
		bounds.union(node.right.bounds);

		node.bounds = bounds;

		node.count = objects.length;

	}

	return node;

}

export { BVHAccel };
