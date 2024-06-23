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

	// TODO: Implement this function
	// Create the model matrix for rotating the triangle around the Z axis.
	// Then return it.

	const theta = MathUtils.degToRad(rotation_angle);

	model.makeRotationZ(theta);

	return model;

}

function get_model_matrix_rodrigues(rotation_angle) {

	const model = new Matrix4();

	const theta = rotation_angle / 180 * Math.PI;
	const cos = Math.cos(theta);
	const sin = Math.sin(theta);

	const n = new Vector3(0, 0, 1);
	n.normalize();

	const nx = n.x;
	const ny = n.y;
	const nz = n.z;

	const N = new Matrix3().set(

		0.0, -nz, ny,
		nz, 0.0, -nx,
		-ny, nx, 0.0,

	);

	const I = new Matrix3();

	// Eigen::Matrix3f R = cos * I + (1.0 - cos) * n * n.transpose() + sin * N;

	// model.block<3, 3>(0, 0) = R;

	model

	return model;

}

function get_projection_matrix(eye_fov, aspect_ratio, zNear, zFar) {

	const projection = new Matrix4();

	// Students will implement this function

	// TODO: Implement this function
	// Create the projection matrix for the given parameters.
	// Then return it.

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