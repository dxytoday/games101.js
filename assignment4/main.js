import { Vector2, Vector3 } from 'three';
import { View } from 'View';

const control_points = [];

function mouse_handler(event) {

	const { offsetX, offsetY } = event;

	const newPoint = new Vector2(offsetX, offsetY);

	control_points.push(newPoint);

}

function naive_bezier(points, w) {

	if (points.length < 4) {

		return;

	}

	const p_0 = points[0];
	const p_1 = points[1];
	const p_2 = points[2];
	const p_3 = points[3];

	const point = new Vector2();
	const color = new Vector3(1, 0, 0);

	for (let t = 0.0; t <= 1.0; t += 0.001) {

		point.set(0, 0);

		point.addScaledVector(p_0, Math.pow(1 - t, 3));
		point.addScaledVector(p_1, Math.pow(1 - t, 2) * t * 3);
		point.addScaledVector(p_2, Math.pow(t, 2) * 3 * (1 - t));
		point.addScaledVector(p_3, Math.pow(t, 3));

		w.drawPixel(point, color);

	}

}

function recursive_bezier(points, t) {

	const lerpPoints = [];

	for (let ii = 0, li = points.length - 1; ii < li; ii++) {

		const lerpPoint = new Vector2();

		const p1 = points[ii];
		const p2 = points[ii + 1];

		lerpPoint.lerpVectors(p1, p2, t);

		lerpPoints.push(lerpPoint);

	}

	if (lerpPoints.length === 1) {

		return lerpPoints[0];

	}

	return recursive_bezier(lerpPoints, t);

}

function bezier(points, w) {

	if (points.length < 2) {

		return;

	}

	for (let t = 0.0; t <= 1.0; t += 0.001) {

		const point = recursive_bezier(points, t);

		anti_aliasing(point, w);

	}

}

function anti_aliasing(point, w) {

	const { x: cx, y: cy } = point.clone().floor();

	const orders = [-1, 0, 1];
	const maxDistance = Math.sqrt(4.5);

	for (const dx of orders) {

		for (const dy of orders) {

			const newPoint = new Vector2(cx + dx, cy + dy);

			newPoint.addScalar(0.5);

			const distance = point.distanceTo(newPoint);

			const ratio = 1 - distance / maxDistance

			newPoint.floor();

			const color = w.readPixel(newPoint);

			color.y = Math.max(color.y, ratio);

			w.drawPixel(newPoint, color);

		}

	}

}

function main() {

	const view = new View();

	view.setMouseCallback(mouse_handler);

	function render() {

		view.clear();

		for (const point of control_points) {

			const color = new Vector3(1, 1, 1);
			view.point(point, 5, color);

		}

		naive_bezier(control_points, view);
		bezier(control_points, view);

	}

	view.startRenderLoop(render);

}

export { main };
