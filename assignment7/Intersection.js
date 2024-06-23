import * as THREE from '../math/three.js';

export class Intersection {

	happened = false;
	coords = new THREE.Vector3();
	tcoords = new THREE.Vector3();
	normal = new THREE.Vector3();
	emit = new THREE.Vector3();
	distance = Infinity;
	obj;
	m;

	pdf = 0;

}