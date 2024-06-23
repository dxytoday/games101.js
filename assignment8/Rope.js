import { Vector2, Vector3 } from "three";
import { Mass } from "./Mass.js";
import { Spring } from "./Spring.js";

function generateMasses(start, end, num, mass, pinneds) {

	const masses = [];

	const coef = 1 / (num - 1);
	const position = new Vector2();

	for (let ii = 0; ii < num; ii++) {

		position.lerpVectors(start, end, ii * coef);

		const pinned = pinneds.includes(ii);
		const newMass = new Mass(position, mass, pinned);

		masses.push(newMass);

	}

	return masses;

}

function generateSprings(masses, k) {

	const springs = [];

	for (let ii = 1, li = masses.length; ii < li; ii++) {

		const massA = masses[ii - 1];
		const massB = masses[ii];

		const spring = new Spring(massA, massB, k);

		springs.push(spring);

	}

	return springs;

}

class Rope {

	/** 所有质点 */
	masses = [];

	/** 所有弹簧 */
	springs = [];

	/** 绳子颜色 */
	color = new Vector3(255, 255, 255);

	/**
	 * 绳子
	 * @param { Vector2 } start 起始位置
	 * @param { Vector2 } end 结束位置
	 * @param { number } num 质点的数量
	 * @param { number } mass 质点的质量
	 * @param { number } k 弹簧的系数
	 * @param { number[] } pinneds 哪些节点是静止的
	 */
	constructor(start, end, num, mass, k, pinneds) {

		this.masses = generateMasses(start, end, num, mass, pinneds);
		this.springs = generateSprings(this.masses, k);

	}

	simulateEuler(delta, gravity) {

		const direction = new Vector2();
		const velocity = new Vector2();

		for (const s of this.springs) {

			// 把 ma 拉向 mb 的力

			direction.subVectors(s.mb.position, s.ma.position);

			const length = direction.length() - s.restLen;

			direction.normalize();
			direction.multiplyScalar(s.ks * length);

			s.ma.forces.add(direction);
			s.mb.forces.sub(direction);

			// 摩檫力

			direction.subVectors(s.mb.position, s.ma.position).normalize();
			velocity.subVectors(s.mb.velocity, s.ma.velocity);

			const kd = 30; // 摩擦力系数
			direction.multiplyScalar(direction.dot(velocity) * kd);

			s.ma.forces.add(direction);
			s.mb.forces.sub(direction);

		}

		for (const m of this.masses) {

			if (m.pinned) {

				m.forces.set(0, 0);

				continue;

			}

			// 重力
			m.forces.addScaledVector(gravity, m.mass);

			// 空气阻力
			const ka = -0.1; // 空气阻力系数
			m.forces.addScaledVector(m.velocity, ka);

			// 加速度
			velocity.copy(m.forces).divideScalar(m.mass);

			m.velocity.addScaledVector(velocity, delta);
			m.position.addScaledVector(m.velocity, delta);

			m.forces.set(0, 0);

		}

	}

	simulateVerlet(delta, gravity) {

		const direction = new Vector2();
		const velocity = new Vector2();
		const tempPosition = new Vector2();

		for (const s of this.springs) {

			direction.subVectors(s.mb.position, s.ma.position);

			const length = direction.length() - s.restLen;

			direction.normalize();
			direction.multiplyScalar(s.ks * length);

			s.ma.forces.add(direction);
			s.mb.forces.sub(direction);

		}

		for (const m of this.masses) {

			if (m.pinned) {

				m.forces.set(0, 0);

				continue;

			}

			// 重力
			m.forces.addScaledVector(gravity, m.mass);

			// 加速度
			velocity.copy(m.forces).divideScalar(m.mass);

			tempPosition.copy(m.position);

			velocity.multiplyScalar(delta * delta);

			// 阻尼系数
			const damp = 0.001;

			m.position.sub(m.lastPosition);
			m.position.multiplyScalar(1 - damp);
			m.position.add(velocity);
			m.position.add(tempPosition);

			m.lastPosition.copy(tempPosition);

			m.forces.set(0, 0);

		}

	}

}

export { Rope };
