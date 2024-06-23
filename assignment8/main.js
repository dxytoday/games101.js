import { Vector2 } from 'three';
import { View } from 'View';
import { Rope } from './Rope.js';

const mass = 1; // 质点的质量，质量越大，受到重力作用时表现出较大的影响 | 牛顿第二定律，力和加速度的关系
const ks = 100; // 弹簧的弹性系数，弹性系数越大，对位移变化更为敏感，提供更强的恢复力

const gravity = new Vector2(0, 20); // 重力值

function main() {

	const view = new View();

	const start = new Vector2(250, 100);
	const end = new Vector2(20, 100);

	const ropeEuler = new Rope(start, end, 16, mass, ks, [0]);
	const ropeVerlet = new Rope(start, end, 16, mass, ks, [0]);

	ropeEuler.color.set(0, 0, 255);
	ropeVerlet.color.set(0, 255, 0);

	const ropes = [ropeEuler, ropeVerlet];

	function render(delta) {

		ropeEuler.simulateEuler(delta, gravity);
		ropeVerlet.simulateVerlet(delta, gravity);

		view.clear();

		for (const rope of ropes) {

			for (const mass of rope.masses) {

				view.point(mass.position, 3, rope.color);

			}

			for (const spring of rope.springs) {

				view.line(spring.ma.position, spring.mb.position, 3, rope.color);

			}

		}

	}

	view.startRenderLoop(render);

}

export { main };