import { Matrix4, Vector2, Vector3, Vector4 } from 'three';
import { Triangle } from "./Triangle.js";
import { vertex_shader_payload, fragment_shader_payload } from './Shader.js';

class Buffers {

	static Color = 1;
	static Depth = 2;

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

function interpolate(alpha, beta, gamma, vert1, vert2, vert3, weight, target) {

	target.setScalar(0);

	const v = target.clone();

	target.add(v.copy(vert1).multiplyScalar(alpha));
	target.add(v.copy(vert2).multiplyScalar(beta));
	target.add(v.copy(vert3).multiplyScalar(gamma));
	target.divideScalar(weight);

	return target;

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

	texture = undefined;
	vertex_shader = undefined;
	fragment_shader = undefined;

	constructor(width, height) {

		this.width = width;
		this.height = height;

		for (let ii = 0, il = width * height; ii < il; ii++) {

			this.frame_buf[ii] = new Vector3();
			this.depth_buf[ii] = Infinity;

		}

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

	draw(TriangleList) {

		const f1 = (50 - 0.1) / 2;
		const f2 = (50 + 0.1) / 2;

		const payload = new vertex_shader_payload();
		const faceNormal = new Vector3();

		for (const t of TriangleList) {

			const newtri = new Triangle();

			for (let ii = 0; ii < 3; ii++) {

				payload.model.copy(this.model);
				payload.view.copy(this.view);
				payload.projection.copy(this.projection);

				payload.position.copy(t.v[ii]);
				payload.normal.copy(t.normal[ii]);

				this.vertex_shader(payload);

				newtri.setVertex(ii, payload.position.clone());
				newtri.setNormal(ii, payload.normal.clone());
				newtri.setTexCoord(ii, t.tex_coords[ii]);
				newtri.mv[ii] = payload.mvPosition.clone();

			}

			// 背面剔除
			faceNormal.copy(newtri.normal[0]);
			faceNormal.add(newtri.normal[1]);
			faceNormal.add(newtri.normal[2]);

			if (faceNormal.z < 0) {

				continue;

			}

			for (const vertex of newtri) {

				// 齐次除法

				vertex.x /= vertex.w;
				vertex.y /= vertex.w;
				vertex.z /= vertex.w;

				// 视口变换

				vertex.x = 0.5 * this.width * (vertex.x + 1);
				vertex.y = 0.5 * this.height * (vertex.y + 1);
				vertex.z = vertex.z * f1 + f2;

			}

			newtri.setColor(0, new Vector3(148, 121, 92));
			newtri.setColor(1, new Vector3(148, 121, 92));
			newtri.setColor(2, new Vector3(148, 121, 92));

			this.rasterize_triangle(newtri);

		}

	}

	// Screen space rasterization
	rasterize_triangle(t) {

		// TODO: From your HW3, get the triangle rasterization code.
		// TODO: Inside your rasterization loop:
		//    * v[i].w() is the vertex view space depth value z.
		//    * Z is interpolated view space depth for the current pixel
		//    * zp is depth between zNear and zFar, used for z-buffer

		// float Z = 1.0 / (alpha / v[0].w() + beta / v[1].w() + gamma / v[2].w());
		// float zp = alpha * v[0].z() / v[0].w() + beta * v[1].z() / v[1].w() + gamma * v[2].z() / v[2].w();
		// zp *= Z;

		// TODO: Interpolate the attributes:
		// auto interpolated_color
		// auto interpolated_normal
		// auto interpolated_texcoords
		// auto interpolated_shadingcoords

		// Use: fragment_shader_payload payload( interpolated_color, interpolated_normal.normalized(), interpolated_texcoords, texture ? &*texture : nullptr);
		// Use: payload.view_pos = interpolated_shadingcoords;
		// Use: Instead of passing the triangle's color directly to the frame buffer, pass the color to the shaders first to get the final color;
		// Use: auto pixel_color = fragment_shader(payload);

		const min_x = Math.floor(Math.min(t.v[0].x, t.v[1].x, t.v[2].x));
		const min_y = Math.floor(Math.min(t.v[0].y, t.v[1].y, t.v[2].y));
		const max_x = Math.ceil(Math.max(t.v[0].x, t.v[1].x, t.v[2].x));
		const max_y = Math.ceil(Math.max(t.v[0].y, t.v[1].y, t.v[2].y));

		const payload = new fragment_shader_payload();
		const normal = new Vector3();
		const mvPosition = new Vector3();
		const uv = new Vector2();

		for (let x = min_x; x < max_x; x++) {

			for (let y = min_y; y < max_y; y++) {

				const cx = x + 0.5;
				const cy = y + 0.5;

				const barycentric = insideTriangle(cx, cy, t.v);

				if (!barycentric) {

					continue;

				}

				const [alpha, beta, gamma] = barycentric;

				const Z = 1.0 / (alpha / t.v[0].w + beta / t.v[1].w + gamma / t.v[2].w);
				let depth = (alpha * t.v[0].z / t.v[0].w + beta * t.v[1].z / t.v[1].w + gamma * t.v[2].z / t.v[2].w);
				depth *= Z;

				const index = this.get_index(x, y);

				if (depth >= this.depth_buf[index]) {

					continue;

				}

				this.depth_buf[index] = depth;

				interpolate(alpha, beta, gamma, t.normal[0], t.normal[1], t.normal[2], 1, normal);
				interpolate(alpha, beta, gamma, t.tex_coords[0], t.tex_coords[1], t.tex_coords[2], 1, uv);
				interpolate(alpha, beta, gamma, t.mv[0], t.mv[1], t.mv[2], 1, mvPosition);
				interpolate(alpha, beta, gamma, t.color[0], t.color[1], t.color[2], 1, payload.color);

				payload.normal = normal.normalize();
				payload.mvPosition = mvPosition;
				payload.uv = uv;
				payload.texture = this.texture;

				this.fragment_shader(payload);

				this.set_pixel(index, payload.color);

			}

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

	set_texture(texture) {

		this.texture = texture;

	}

	set_vertex_shader(vert_shader) {

		this.vertex_shader = vert_shader;

	}

	set_fragment_shader(frag_shader) {

		this.fragment_shader = frag_shader;

	}

}

export { Rasterizer, Buffers };
