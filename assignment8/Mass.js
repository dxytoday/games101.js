import { Vector2 } from "three"

/** 质点 */
class Mass {

	/** 当前位置 */
	position = new Vector2();

	/** 质量 */
	mass = 0;

	/** 是否静止 */
	pinned = false;

	/** Verlet 属性 */
	lastPosition = new Vector2();

	/** Euler 属性 */
	velocity = new Vector2();

	/** Euler 属性 */
	forces = new Vector2();


	constructor(position, mass, pinned = false) {

		this.position.copy(position);

		this.lastPosition.copy(position);

		this.mass = mass;
		this.pinned = pinned;

	}

}

export { Mass };
