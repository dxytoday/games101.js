import { Matrix4, MathUtils, Vector3 } from 'three';
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

	// TODO: Copy-paste your implementation from the previous assignment.

	const theta = MathUtils.degToRad(rotation_angle);

	model.makeRotationZ(theta);

	return model;

}

function get_projection_matrix(eye_fov, aspect_ratio, zNear, zFar) {

	const projection = new Matrix4();

	// TODO: Copy-paste your implementation from the previous assignment.

	let top = zNear * Math.tan(MathUtils.DEG2RAD * 0.5 * eye_fov);
	let height = 2 * top;
	let width = aspect_ratio * height;
	let left = - 0.5 * width;

	projection.makePerspective(left, left + width, top, top - height, zNear, zFar);

	return projection;

}

function main() {

	const view = new View();

	let angle = 0;

	const r = new Rasterizer(view.width, view.height);

	const eye_pos = new Vector3(0, 0, 5);

	const pos = [

		new Vector3(2, 0, -2),
		new Vector3(0, 2, -2),
		new Vector3(-2, 0, -2),
		new Vector3(3.5, -1, -5),
		new Vector3(2.5, 1.5, -5),
		new Vector3(-1, 0.5, -5),

	];

	const ind = [
		new Vector3(0, 1, 2),
		new Vector3(3, 4, 5),
	];

	const cols = [

		new Vector3(255, 0, 0),
		new Vector3(0, 255, 0),
		new Vector3(0, 0, 255),

		new Vector3(0, 255, 255),
		new Vector3(255, 0, 255),
		new Vector3(255, 255, 0),

	];

	const pos_id = r.load_positions(pos);
	const ind_id = r.load_indices(ind);
	const col_id = r.load_colors(cols);

	function render() {

		r.clear(Buffers.Color | Buffers.Depth);

		r.set_model(get_model_matrix(angle));
		r.set_view(get_view_matrix(eye_pos));
		r.set_projection(get_projection_matrix(45, 1, 0.1, 50));

		r.draw(pos_id, ind_id, col_id, Primitive.Triangle);

		view.fill(r.frame_buf);

	}

	view.startRenderLoop(render);

}

export { main };