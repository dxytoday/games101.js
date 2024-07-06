import { Vector2, Vector3 } from "three";
import { Mass } from "./Mass.js";
import { Spring } from "./Spring.js";

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

	}

	simulateEuler(delta, gravity) {



	}

	simulateVerlet(delta, gravity) {



	}

}

export { Rope };
