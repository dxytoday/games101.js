import { Buffers, Primitive, Rasterizer } from "./Rasterizer";
import { Matrix4 } from "./math/Matrix4";
import { Vector3 } from "./math/Vector3";

let context: CanvasRenderingContext2D;
let image: ImageData;

function get_model_matrix(angle: number): Matrix4 {

	const model = new Matrix4();

	const theta = angle / 180 * Math.PI;
	const cos = Math.cos(theta);
	const sin = Math.sin(theta);

	model.set(

		cos, -sin, 0, 0,
		sin, cos, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1

	);

	return model;

}

function get_view_matrix(eye_pos: Vector3): Matrix4 {

	const view = new Matrix4();

	view.set(

		1, 0, 0, -eye_pos.x,
		0, 1, 0, -eye_pos.y,
		0, 0, 1, -eye_pos.z,
		0, 0, 0, 1,

	);

	return view;

}

function get_projection_matrix(eye_fov: number, aspect_ratio: number, zNear: number, zFar: number): Matrix4 {

	const projection = new Matrix4();

	const theta = eye_fov / 180 * Math.PI * 0.5;
	const yTop = -zNear * Math.tan(theta);
	const yBottom = -yTop;
	const xRight = yTop * aspect_ratio;
	const xLeft = -xRight;

	const pers = new Matrix4().set(

		zNear, 0, 0, 0,
		0, zNear, 0, 0,
		0, 0, zNear + zFar, -zFar * zNear,
		0, 0, 1, 0

	);

	const tran = new Matrix4().set(

		1, 0, 0, -(xLeft + xRight) / 2,
		0, 1, 0, -(yTop + yBottom) / 2,
		0, 0, 1, -(zNear + zFar) / 2,
		0, 0, 0, 1,

	);

	const scal = new Matrix4().set(

		2 / (xRight - xLeft), 0, 0, 0,
		0, 2 / (yTop - yBottom), 0, 0,
		0, 0, 2 / (zNear - zFar), 0,
		0, 0, 0, 1,

	);

	projection.multiplyMatrices(tran, pers);
	projection.multiplyMatrices(scal, projection);

	return projection;

}

export function main(canvas: HTMLCanvasElement): void {

	let angle = 0;

	const r = new Rasterizer(canvas.width, canvas.height);

	const eye_pos = new Vector3(0, 0, 5);

	const pos = [
		new Vector3(2, 0, -2),
		new Vector3(0, 2, -2),
		new Vector3(-2, 0, -2),
		new Vector3(3.5, -1, -5),
		new Vector3(2.5, 1.5, -5),
		new Vector3(-1, 0.5, -5),
	]

	const cols = [
		new Vector3(217, 238, 185),
		new Vector3(217, 238, 185),
		new Vector3(217, 238, 185),
		new Vector3(185, 217, 238),
		new Vector3(185, 217, 238),
		new Vector3(185, 217, 238),
	]

	const ind = [
		new Vector3(0, 1, 2),
		new Vector3(3, 4, 5),
	]

	const pos_id = r.load_positions(pos);
	const col_id = r.load_colors(cols);
	const ind_id = r.load_indices(ind);

	function render(): void {

		requestAnimationFrame(render); // 循环调用

		r.clear(Buffers.Color | Buffers.Depth);

		r.set_model(get_model_matrix(angle));
		r.set_view(get_view_matrix(eye_pos));
		r.set_projection(get_projection_matrix(45, 1, 0.1, 50));

		r.draw(pos_id, ind_id, col_id, Primitive.Triangle);

		// 模拟 openCV

		if (!image) {

			context = canvas.getContext('2d') as CanvasRenderingContext2D;
			image = context.getImageData(0, 0, canvas.width, canvas.height);

		}

		for (let ii = 0, li = image.data.length; ii < li; ii += 4) {

			const color = r.frame_buf[ii / 4];

			image.data[ii] = color.x;
			image.data[ii + 1] = color.y;
			image.data[ii + 2] = color.z;
			image.data[ii + 3] = 255;

		}

		context.putImageData(image, 0, 0);

	}

	render();

}