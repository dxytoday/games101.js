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

class Rasterizer {

	buffers = [];

	frame_buf = [];
	depth_buf = [];

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

	clear(buffer) {

		const il = this.width * this.height;

		if ((buffer & Buffers.Color) === Buffers.Color) {

			for (let ii = 0; ii < il; ii++) {

				this.frame_buf[ii].set(0, 0, 0);

			}

		}

		if ((buffer & Buffers.Depth) === Buffers.Depth) {

			for (let ii = 0; ii < il; ii++) {

				this.depth_buf[ii] = Infinity;

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

	draw(pos_buffer, ind_buffer, type) {

		if (type !== Primitive.Triangle) {

			throw 'Drawing primitives other than triangle is not implemented yet!';

		}

		const buf = this.buffers[pos_buffer];
		const ind = this.buffers[ind_buffer];

		const f1 = (100 - 0.1) / 2;
		const f2 = (100 + 0.1) / 2;

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

			for (const vec of v) {

				vec.divideScalar(vec.w);

			}

			for (const vert of v) {

				vert.x = 0.5 * this.width * (vert.x + 1);
				vert.y = 0.5 * this.height * (vert.y + 1);
				vert.z = vert.z * f1 + f2;

			}

			t.setVertex(0, v[0]);
			t.setVertex(1, v[1]);
			t.setVertex(2, v[2]);

			this.rasterize_wireframe(t);

		}

	}

	rasterize_wireframe(t) {

		this.draw_line(t.c, t.a);
		this.draw_line(t.c, t.b);
		this.draw_line(t.b, t.a);

	}

	draw_line(begin, end) {

		const segment_x = Math.ceil(Math.abs(end.x - begin.x));
		const segment_y = Math.ceil(Math.abs(end.y - begin.y));
		const segments = Math.max(segment_x, segment_y);

		const point = new Vector2();
		const color = new Vector3(1, 1, 1);

		for (let ii = 0; ii < segments; ii++) {

			const alpha = ii / (segments - 1);

			point.copy(begin).lerp(end, alpha).round();

			const index = this.get_index(point.x, point.y);

			this.set_pixel(index, color);

		}

	}

	get_index(x, y) {

		return (this.height - 1 - y) * this.width + x;

	}

	set_pixel(index, color) {

		if (!this.frame_buf[index]) {

			return;

		}

		this.frame_buf[index].copy(color);

	}

}

export { Rasterizer, Primitive, Buffers };