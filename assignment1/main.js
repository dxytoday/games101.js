import { Matrix4, MathUtils, Vector3, Matrix3 } from 'three';
import { View } from 'View';
import { Buffers, Primitive, Rasterizer } from './Rasterizer.js';

function get_view_matrix(eye_pos) {

	const view = new Matrix4();

	view.set(

		1, 0, 0, -eye_pos.x,
		0, 1, 0, -eye_pos.y,
		0, 0, 1, -eye_pos.z,
		0, 0, 0, 1,

	);

	return view;

}

function get_model_matrix(rotation_angle) {

	const model = new Matrix4();

	return model;

}

function get_projection_matrix(eye_fov, aspect_ratio, zNear, zFar) {

	const projection = new Matrix4();

	return projection;

}

function main() {

	const view = new View();

	let angle = 0;

	const r = new Rasterizer(view.width, view.height);

	const eye_pos = new Vector3(0, 0, 5);

	const pos = [new Vector3(2, 0, -2), new Vector3(0, 2, -2), new Vector3(-2, 0, -2)];

	const ind = [new Vector3(0, 1, 2)];

	const pos_id = r.load_positions(pos);
	const ind_id = r.load_indices(ind);

	function render(delta) {

		r.clear(Buffers.Color | Buffers.Depth);

		r.set_model(get_model_matrix(angle));
		r.set_view(get_view_matrix(eye_pos));
		r.set_projection(get_projection_matrix(45, 1, 0.1, 50));

		r.draw(pos_id, ind_id, Primitive.Triangle);

		view.fill(r.frame_buf);

		if (view.key === 'a') {

			angle = (angle + delta * 45) % 360;

		} else if (view.key === 'd') {

			angle = (angle - delta * 45) % 360;

		}

	}

	view.startRenderLoop(render);

}

export { main };