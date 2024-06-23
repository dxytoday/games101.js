import * as THREE from '../math/three.js';
import { Bounds3 } from "./Bounds3.js";
import { Intersection } from './Intersection.js';

export const SplitMethod = {

	NAIVE: 0,
	SAH: 1,

}


export class BVHBuildNode {

	bounds;
	left;
	right;
	object;
	area;

	splitAxis = 0;
	firstPrimOffset = 0;
	nPrimitives = 0;

};


export class BVHAccel {

	maxPrimsInNode = 1;
	splitMethod = SplitMethod.NAIVE;
	primitives;

	root;

	constructor(objects) {

		this.primitives = objects;

		this.root = this.recursiveBuild(objects);

	}

	recursiveBuild(objects) {

		const node = new BVHBuildNode();

		const bounds = new Bounds3();

		for (const object of objects) {

			bounds.union(object.bounds);

		}

		if (objects.length === 1) {

			node.bounds = bounds;
			node.object = objects[0];
			node.area = node.object.getArea();

			return node;

		} else if (objects.length === 2) {

			node.left = this.recursiveBuild([objects[0]]);
			node.right = this.recursiveBuild([objects[1]]);
			node.bounds = bounds;

			node.area = node.left.area + node.right.area;

			return node;

		} else {

			const centroidBounds = new Bounds3();

			for (const object of objects) {

				centroidBounds.expandByPoint(object.bounds.centroid())

			}

			const dim = centroidBounds.maxExtent();

			switch (dim) {

				case 0:

					objects.sort((a, b) => a.bounds.centroid().x - b.bounds.centroid().x);

					break;

				case 1:

					objects.sort((a, b) => a.bounds.centroid().y - b.bounds.centroid().y);

					break;

				case 2:

					objects.sort((a, b) => a.bounds.centroid().z - b.bounds.centroid().z);

					break;

			}

			const middling = Math.ceil(objects.length / 2);

			// if(SAH){
			// 	// 递归分离节点
			// 	int part = 10;
			// 	auto size = objects.size();
			// 	int proper_cut = 0;
			// 	double mintime = 0x3f3f3f;
			// 	for(int index=0; index<part; index++){
			// 		middling = objects.begin() + size * index / part;
			// 		auto leftshapes = std::vector<Object*>(beginning, middling);
			// 		auto rightshapes = std::vector<Object*>(middling, ending);

			// 		assert(objects.size() == (leftshapes.size() + rightshapes.size()));

			// 		Bounds3 leftBounds,rightBounds;
			// 		//     time = S_1面积 /S_0面积 *S_1空间物体数 * t_obj    
			// 		//              + S_2面积 /S_0面积 *S_2空间物体数 * t_obj 
			// 		for (int i = 0; i < leftshapes.size(); ++i)
			// 			leftBounds =
			// 				Union(leftBounds, leftshapes[i]->getBounds().Centroid());
			// 		for (int i = 0; i < rightshapes.size(); ++i)
			// 			rightBounds =
			// 				Union(rightBounds, rightshapes[i]->getBounds().Centroid());

			// 		auto leftS = leftBounds.SurfaceArea();
			// 		auto rightS = rightBounds.SurfaceArea();
			// 		auto S = leftS + rightS;
			// 		auto time = leftS / S * leftshapes.size() + rightS / S * rightshapes.size();
			// 		if(time<mintime){
			// 			mintime = time;
			// 			proper_cut = index;
			// 		}
			// 	}
			// 	middling = objects.begin() +  size * proper_cut/ part;
			// }

			const leftshapes = objects.slice(0, middling);
			const rightshapes = objects.slice(middling, objects.length);

			node.left = this.recursiveBuild(leftshapes);
			node.right = this.recursiveBuild(rightshapes);

			node.bounds = bounds.union(node.left.bounds, node.right.bounds);

			node.area = node.left.area + node.right.area;

		}

		return node;

	}

	intersect(ray) {

		if (!this.root) {

			return new Intersection();

		}

		return this.getIntersection(this.root, ray);

	}

	getIntersection(node, ray) {

		// TODO Traverse the BVH to find intersection

		const dirIsNeg = [
			ray.direction.x < 0,
			ray.direction.y < 0,
			ray.direction.z < 0,
		];

		if (!node.bounds.intersectP(ray, ray.direction_inv, dirIsNeg)) {

			return new Intersection();;

		}

		if (!node.left && !node.right) {

			return node.object.getIntersection(ray);

		}

		const h1 = this.getIntersection(node.left, ray);
		const h2 = this.getIntersection(node.right, ray);

		return h1.distance < h2.distance ? h1 : h2;

	}

	getSample(node, p, pos) {

		if (!node.left && !node.right) {

			node.object.sample(pos);

			pos.pdf *= node.area;

			return;

		}

		if (p < node.left.area) {

			this.getSample(node.left, p, pos);

		} else {

			this.getSample(node.right, p - node.left.area, pos);

		}

	}

	sample(pos) {

		const p = this.root.area * Math.sqrt(Math.random());

		this.getSample(this.root, p, pos);

		pos.pdf /= this.root.area;

	}

}