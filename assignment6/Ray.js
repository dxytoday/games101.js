class Ray {

	origin = undefined;
	direction = undefined;
	direction_inv = undefined;

	constructor(origin, direction) {

		this.origin = origin;
		this.direction = direction;

		this.direction_inv = direction.clone();

		this.direction_inv.x = 1 / this.direction_inv.x;
		this.direction_inv.y = 1 / this.direction_inv.y;
		this.direction_inv.z = 1 / this.direction_inv.z;

	}

}

export { Ray };
