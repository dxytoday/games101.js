export class Ray {

	intersection = false;

	origin;
	direction;

	direction_inv;

	constructor(origin, direction) {

		this.origin = origin;
		this.direction = direction;

		this.direction_inv = direction.clone();

		this.direction_inv.x = 1 / this.direction_inv.x;
		this.direction_inv.y = 1 / this.direction_inv.y;
		this.direction_inv.z = 1 / this.direction_inv.z;

	}

}