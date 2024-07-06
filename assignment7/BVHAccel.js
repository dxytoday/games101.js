import { Bounds3 } from "./Bounds3.js";

class BVHBuildNode {

	bounds = undefined;
	left = undefined;
	right = undefined;
	object = undefined;
	area = 0;

	count = 0;

	splitAxis = 0;
	firstPrimOffset = 0;
	nPrimitives = 0;

};

class BVHAccel {

	maxPrimsInNode = 1;

	primitives = undefined;

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



	}

	areaSampling() {

		const p = this.root.area * Math.sqrt(Math.random());

		const sample = recursiveAreaSample(this.root, p);

		sample.pdf /= this.root.area;

		return sample;

	}

}

function recursiveAreaSample(node, p) {

	if (!node.left && !node.right) {

		const sample = node.object.areaSampling();
		sample.pdf *= node.area;

		return sample;

	}

	if (p < node.left.area) {

		return recursiveAreaSample(node.left, p);

	} else {

		return recursiveAreaSample(node.right, p - node.left.area);

	}

}

function recursiveBuild(objects) {

	const node = new BVHBuildNode();

	const bounds = new Bounds3();

	for (const object of objects) {

		bounds.union(object.getBounds());

	}

	if (objects.length === 1) {

		node.object = objects[0];
		node.bounds = bounds;
		node.area = node.object.getArea();

		return node;

	}

	else if (objects.length === 2) {

		const leftObjects = objects.slice(0, 1);
		const rightObjects = objects.slice(1, 2);

		node.left = recursiveBuild(leftObjects);
		node.right = recursiveBuild(rightObjects);

		node.bounds = bounds;
		node.area = node.left.area + node.right.area;

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
		node.area = node.left.area + node.right.area;

	}

	return node;

}

export { BVHAccel };
