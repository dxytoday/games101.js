import { Matrix4, Vector2, Vector3, Vector4 } from 'three';
import { Triangle } from "./Triangle.js";

class Primitive {

	static Line = 0;
	static Triangle = 1;

}

class Buffers {

	static Color = 1;
	static Depth = 2;

}

function to_vec4(v3, w = 1) {

	return new Vector4(v3.x, v3.y, v3.z, w);

}

function insideTriangle(x, y, _v) {

	// TODO : Implement this function to check if the point (x, y) is inside the triangle represented by _v[0], _v[1], _v[2]

	const bary = computeBarycentric2D(x, y, _v);

	if (

		bary[0] >= 0 &&
		bary[1] >= 0 &&
		bary[2] >= 0 &&

		(

			bary[0] +
			bary[1] +
			bary[2]

		).toFixed(4) === '1.0000'

	) {

		return bary;

	}

}

function computeBarycentric2D(x, y, v) {

	const p0 = v[0];
	const p1 = v[1];
	const p2 = v[2];

	const c1 = (

		(

			x * (p1.y - p2.y) +
			(p2.x - p1.x) * y +
			p1.x * p2.y -
			p2.x * p1.y

		) / (

			p0.x * (p1.y - p2.y) +
			(p2.x - p1.x) * p0.y +
			p1.x * p2.y -
			p2.x * p1.y

		)

	);

	const c2 = (

		(

			x * (p2.y - p0.y) +
			(p0.x - p2.x) * y +
			p2.x * p0.y -
			p0.x * p2.y

		) / (

			p1.x * (p2.y - p0.y) +
			(p0.x - p2.x) * p1.y +
			p2.x * p0.y -
			p0.x * p2.y

		)

	);

	const c3 = (

		(

			x * (p0.y - p1.y) +
			(p1.x - p0.x) * y +
			p0.x * p1.y -
			p1.x * p0.y

		) / (

			p2.x * (p0.y - p1.y) +
			(p1.x - p0.x) * p2.y +
			p0.x * p1.y -
			p1.x * p0.y

		)

	);

	return [c1, c2, c3];

}

const super_sample_step = [

	[0.25, 0.25],
	[0.75, 0.25],
	[0.25, 0.75],
	[0.75, 0.75],

];

class Rasterizer {

	buffers = [];

	frame_buf = [];
	depth_buf = [];

	super_frame_buf = [];
	super_depth_buf = [];

	width = 0;
	height = 0;

	model = undefined;
	view = undefined;
	projection = undefined;

	constructor(width, height) {

		this.width = width;
		this.height = height;

		for (let ii = 0, il = width * height; ii < il; ii++) {

			this.frame_buf[ii] = new Vector3();
			this.depth_buf[ii] = Infinity;

		}

		for (let ii = 0, il = width * height * 4; ii < il; ii++) {

			this.super_frame_buf[ii] = new Vector3();
			this.super_depth_buf[ii] = Infinity;

		}

	}

	get_next_id() {

		return this.buffers.length;

	}

	load_positions(positions) {

		const id = this.get_next_id();

		this.buffers[id] = positions;

		return id;

	}

	load_indices(indices) {

		const id = this.get_next_id();

		this.buffers[id] = indices;

		return id;

	}

	load_colors(indices) {

		const id = this.get_next_id();

		this.buffers[id] = indices;

		return id;

	}

	clear(buffer) {

		const il = this.width * this.height;
		const il_s = this.width * this.height * 4;

		if ((buffer & Buffers.Color) === Buffers.Color) {

			for (let ii = 0; ii < il; ii++) {

				this.frame_buf[ii].set(0, 0, 0);

			}

			for (let ii = 0; ii < il_s; ii++) {

				this.super_frame_buf[ii].set(0, 0, 0);

			}

		}

		if ((buffer & Buffers.Depth) === Buffers.Depth) {

			for (let ii = 0; ii < il; ii++) {

				this.depth_buf[ii] = Infinity;

			}

			for (let ii = 0; ii < il_s; ii++) {

				this.super_depth_buf[ii] = Infinity;

			}

		}

	}

	set_model(matrix) {

		this.model = matrix;

	}

	set_view(matrix) {

		this.view = matrix;

	}

	set_projection(matrix) {

		this.projection = matrix;

	}

	draw(pos_buffer, ind_buffer, col_buffer, _type) {

		const buf = this.buffers[pos_buffer];
		const ind = this.buffers[ind_buffer];
		const col = this.buffers[col_buffer];

		const f1 = (50 - 0.1) / 2;
		const f2 = (50 + 0.1) / 2;

		const mvp = new Matrix4();
		mvp.multiplyMatrices(this.view, this.model);
		mvp.multiplyMatrices(this.projection, mvp);

		for (const i of ind) {

			const t = new Triangle();

			const v = [

				to_vec4(buf[i.x]).applyMatrix4(mvp),
				to_vec4(buf[i.y]).applyMatrix4(mvp),
				to_vec4(buf[i.z]).applyMatrix4(mvp),

			];

			// Homogeneous division
			for (const vec of v) {

				vec.divideScalar(vec.w);

			}

			// Viewport transformation
			for (const vert of v) {

				vert.x = 0.5 * this.width * (vert.x + 1);
				vert.y = 0.5 * this.height * (vert.y + 1);
				vert.z = vert.z * f1 + f2;

			}

			t.setVertex(0, v[0]);
			t.setVertex(1, v[1]);
			t.setVertex(2, v[2]);

			t.setColor(0, col[i.x]);
			t.setColor(1, col[i.y]);
			t.setColor(2, col[i.z]);

			this.rasterize_triangle_msaa(t);

		}

	}

	// Screen space rasterization
	rasterize_triangle(t) {

		const v = t.v;

		// TODO : Find out the bounding box of current triangle.
		// iterate through the pixel and find if the current pixel is inside the triangle

		// If so, use the following code to get the interpolated z value.
		//auto[alpha, beta, gamma] = computeBarycentric2D(x, y, t.v);
		//float w_reciprocal = 1.0/(alpha / v[0].w() + beta / v[1].w() + gamma / v[2].w());
		//float z_interpolated = alpha * v[0].z() / v[0].w() + beta * v[1].z() / v[1].w() + gamma * v[2].z() / v[2].w();
		//z_interpolated *= w_reciprocal;

		// TODO : set the current pixel (use the set_pixel function) to the color of the triangle (use getColor function) if it should be painted.

		const a = v[0];
		const b = v[1];
		const c = v[2];

		const min_x = Math.floor(Math.min(a.x, b.x, c.x));
		const min_y = Math.floor(Math.min(a.y, b.y, c.y));
		const max_x = Math.ceil(Math.max(a.x, b.x, c.x));
		const max_y = Math.ceil(Math.max(a.y, b.y, c.y));

		const color = new Vector3();

		for (let x = min_x; x < max_x; x++) {

			for (let y = min_y; y < max_y; y++) {

				const cx = x + 0.5;
				const cy = y + 0.5;

				const barycentric = insideTriangle(cx, cy, v);

				if (!barycentric) {

					continue;

				}

				const [alpha, beta, gamma] = barycentric;

				const index = this.get_index(x, y);

				const depth = alpha * a.z + beta * b.z + gamma * c.z;

				if (depth >= this.depth_buf[index]) {

					continue;

				}

				this.depth_buf[index] = depth;

				color.set(0, 0, 0);
				color.addScaledVector(t.color[0], alpha);
				color.addScaledVector(t.color[1], beta);
				color.addScaledVector(t.color[2], gamma);

				this.set_pixel(index, color);

			}

		}
	}

	rasterize_triangle_msaa(t) {

		const v = t.v;

		// TODO : Find out the bounding box of current triangle.
		// iterate through the pixel and find if the current pixel is inside the triangle

		// If so, use the following code to get the interpolated z value.
		//auto[alpha, beta, gamma] = computeBarycentric2D(x, y, t.v);
		//float w_reciprocal = 1.0/(alpha / v[0].w() + beta / v[1].w() + gamma / v[2].w());
		//float z_interpolated = alpha * v[0].z() / v[0].w() + beta * v[1].z() / v[1].w() + gamma * v[2].z() / v[2].w();
		//z_interpolated *= w_reciprocal;

		// TODO : set the current pixel (use the set_pixel function) to the color of the triangle (use getColor function) if it should be painted.

		const a = v[0];
		const b = v[1];
		const c = v[2];

		const min_x = Math.floor(Math.min(a.x, b.x, c.x));
		const min_y = Math.floor(Math.min(a.y, b.y, c.y));
		const max_x = Math.ceil(Math.max(a.x, b.x, c.x));
		const max_y = Math.ceil(Math.max(a.y, b.y, c.y));

		const color = new Vector3();

		for (let x = min_x; x < max_x; x++) {

			for (let y = min_y; y < max_y; y++) {

				let needsUpdate = false;

				for (let ii = 0; ii < 4; ii++) {

					const cx = x + super_sample_step[ii][0];
					const cy = y + super_sample_step[ii][1];

					const barycentric = insideTriangle(cx, cy, v);

					if (!barycentric) {

						continue;

					}

					const [alpha, beta, gamma] = barycentric;

					const depth = alpha * a.z + beta * b.z + gamma * c.z;


					const super_x = x * 2 + ii % 2;
					const super_y = y * 2 + Math.floor(ii / 2);

					const super_index = this.get_super_index(super_x, super_y);

					if (depth >= this.super_depth_buf[super_index]) {

						continue;

					}

					this.super_depth_buf[super_index] = depth;

					color.set(0, 0, 0);
					color.addScaledVector(t.getColor(0), alpha);
					color.addScaledVector(t.getColor(1), beta);
					color.addScaledVector(t.getColor(2), gamma);

					this.super_frame_buf[super_index].copy(color);

					needsUpdate = true;

				}

				if (!needsUpdate) {

					continue;

				}

				color.set(0, 0, 0);
				color.add(this.super_frame_buf[this.get_super_index(x * 2, y * 2)]);
				color.add(this.super_frame_buf[this.get_super_index(x * 2 + 1, y * 2)]);
				color.add(this.super_frame_buf[this.get_super_index(x * 2, y * 2 + 1)]);
				color.add(this.super_frame_buf[this.get_super_index(x * 2 + 1, y * 2 + 1)]);
				color.divideScalar(4);

				const index = this.get_index(x, y);

				this.depth_buf[index] = this.super_depth_buf[this.get_super_index(x * 2, y * 2)];
				this.depth_buf[index] += this.super_depth_buf[this.get_super_index(x * 2 + 1, y * 2)];
				this.depth_buf[index] += this.super_depth_buf[this.get_super_index(x * 2, y * 2 + 1)];
				this.depth_buf[index] += this.super_depth_buf[this.get_super_index(x * 2 + 1, y * 2 + 1)];
				this.depth_buf[index] /= 4;

				this.set_pixel(index, color);

			}

		}
	}

	get_index(x, y) {

		return (this.height - 1 - y) * this.width + x;

	}

	get_super_index(x, y) {

		return (this.height * 2 - 1 - y) * this.width * 2 + x;

	}

	set_pixel(index, color) {

		if (!this.frame_buf[index]) {

			return;

		}

		this.frame_buf[index].copy(color);

	}

}

export { Rasterizer, Primitive, Buffers };
