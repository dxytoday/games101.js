import { Matrix4, MathUtils, Vector2, Vector3, Vector4, OBJLoader } from 'three';
import { View } from 'View';
import { Rasterizer, Buffers } from './Rasterizer.js';
import { Triangle } from './Triangle.js';
import { Texture } from './Texture.js';

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

	model.makeRotationY(theta);

	const scale = new Matrix4().makeScale(2.5, 2.5, 2.5);

	model.multiply(scale);

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

function vertex_shader(payload) {

	const model = payload.model;
	const view = payload.view;
	const projection = payload.projection;

	const position = payload.position;
	const normal = payload.normal;
	const mvPosition = payload.mvPosition;

	const mv = view.multiply(model);
	const mvp = projection.multiply(mv);

	mvPosition.copy(position);
	mvPosition.applyMatrix4(mv);

	mv.invert().transpose();

	position.applyMatrix4(mvp);

	normal.transformDirection(mv);

}

function normal_fragment_shader(payload) {

	const color = payload.color;
	const normal = payload.normal;

	color.copy(normal);

	color.normalize();
	color.addScalar(1);
	color.divideScalar(2);

}

function texture_fragment_shader(payload) {

	const color = payload.color;
	const normal = payload.normal;
	const uv = payload.uv;
	const texture = payload.texture;
	const mvPosition = payload.mvPosition

	const lights = [
		{ position: new Vector3(20, 20, 20), intensity: 500 },
		{ position: new Vector3(-20, 20, 0), intensity: 500 },
	];

	let ka = 0.2;
	let kd = 0;
	let ks = 0;

	const N = new Vector3();
	const V = new Vector3();
	const L = new Vector3();
	const H = new Vector3();

	N.copy(normal).normalize();
	V.copy(mvPosition).negate().normalize();

	for (const light of lights) {

		L.copy(light.position).sub(mvPosition).normalize();
		H.addVectors(L, V).normalize();

		const NoL = Math.max(0, N.dot(L));
		const NoH = Math.max(0, N.dot(H));

		const distance = light.position.distanceTo(mvPosition);
		const intensity = light.intensity / (distance * distance);

		kd += intensity * NoL;
		ks += intensity * Math.pow(NoH, 150);

	}

	const texel = new Vector3();

	texture.getColorBilinear(uv.x, uv.y, texel);

	color.setScalar(0);
	color.addScaledVector(texel, ka);
	color.addScaledVector(texel, kd);
	color.addScaledVector(texel, ks);

}

function phong_fragment_shader(payload) {

	const color = payload.color;
	const normal = payload.normal;
	const mvPosition = payload.mvPosition

	const lights = [
		{ position: new Vector3(20, 20, 20), intensity: 500 },
		{ position: new Vector3(-20, 20, 0), intensity: 500 },
	];

	let ka = 0.2;
	let kd = 0;
	let ks = 0;

	const N = new Vector3();
	const V = new Vector3();
	const L = new Vector3();
	const H = new Vector3();

	N.copy(normal).normalize();
	V.copy(mvPosition).negate().normalize();

	for (const light of lights) {

		L.copy(light.position).sub(mvPosition).normalize();
		H.addVectors(L, V).normalize();

		const NoL = Math.max(0, N.dot(L));
		const NoH = Math.max(0, N.dot(H));

		const distance = light.position.distanceTo(mvPosition);
		const intensity = light.intensity / (distance * distance);

		kd += intensity * NoL;
		ks += intensity * Math.pow(NoH, 150);

	}

	const texel = color.clone();

	color.setScalar(0);
	color.addScaledVector(texel, ka);
	color.addScaledVector(texel, kd);
	color.addScaledVector(texel, ks);

}

function displacement_fragment_shader(payload) {

	const color = payload.color;
	const normal = payload.normal;
	const mvPosition = payload.mvPosition

	const texel = color.clone();

	const uv = payload.uv;
	const texture = payload.texture;

	//#region 计算位移量

	const kh = 0.2, kn = 0.1;
	const { x, y, z } = normal;

	const t = new Vector3();
	t.x = x * y / Math.sqrt(x * x + z * z);
	t.y = Math.sqrt(x * x + z * z);
	t.z = z * y / Math.sqrt(x * x + z * z);
	t.normalize();

	const b = new Vector3();
	b.crossVectors(normal, t).normalize();

	const TBN = new Matrix4();
	TBN.makeBasis(t, b, normal);

	const { x: u, y: v } = uv;
	const { width: w, height: h } = texture;

	const len = texture.getColor(u, v, color).length() * 255;

	const len1 = texture.getColor(u + 1 / w, v, color).length() * 255;
	const dU = kh * kn * (len1 - len);

	const len2 = texture.getColor(u, v + 1 / h, color).length() * 255;
	const dV = kh * kn * (len2 - len);

	mvPosition.add(normal.multiplyScalar(kn * len));

	//#endregion

	const lights = [
		{ position: new Vector3(20, 20, 20), intensity: 500 },
		{ position: new Vector3(-20, 20, 0), intensity: 500 },
	];

	let ka = 0.2;
	let kd = 0;
	let ks = 0;

	const N = new Vector3();
	const V = new Vector3();
	const L = new Vector3();
	const H = new Vector3();

	N.set(-dU, -dV, 1).applyMatrix4(TBN).normalize();
	V.copy(mvPosition).negate().normalize();

	for (const light of lights) {

		L.copy(light.position).sub(mvPosition).normalize();
		H.addVectors(L, V).normalize();

		const NoL = Math.max(0, N.dot(L));
		const NoH = Math.max(0, N.dot(H));

		const distance = light.position.distanceTo(mvPosition);
		const intensity = light.intensity / (distance * distance);

		kd += intensity * NoL;
		ks += intensity * Math.pow(NoH, 150);

	}

	color.setScalar(0);
	color.addScaledVector(texel, ka);
	color.addScaledVector(texel, kd);
	color.addScaledVector(texel, ks);

}

function bump_fragment_shader(payload) {

	const color = payload.color;
	const normal = payload.normal;
	const uv = payload.uv;
	const texture = payload.texture;

	const kh = 0.2, kn = 0.1;

	const { x, y, z } = normal;

	const t = new Vector3();
	t.x = x * y / Math.sqrt(x * x + z * z);
	t.y = Math.sqrt(x * x + z * z);
	t.z = z * y / Math.sqrt(x * x + z * z);
	t.normalize();

	const b = new Vector3();
	b.crossVectors(normal, t).normalize();

	const TBN = new Matrix4();
	TBN.makeBasis(t, b, normal);

	const { x: u, y: v } = uv;
	const { width: w, height: h } = texture;

	const len = texture.getColor(u, v, color).length() * 255;

	const len1 = texture.getColor(u + 1 / w, v, color).length() * 255;
	const dU = kh * kn * (len1 - len);

	const len2 = texture.getColor(u, v + 1 / h, color).length() * 255;
	const dV = kh * kn * (len2 - len);

	color.set(-dU, -dV, 1);
	color.applyMatrix4(TBN);
	color.normalize();

}

async function main() {

	const view = new View();

	const TriangleList = [];
	let angle = 140;

	const Loader = new OBJLoader();
	const obj_path = './assignment3/resources/';

	// Load .obj File
	const loadout = await Loader.load('./assignment3/resources/spot_triangulated_good.obj');
	for (let ii = 0, il = loadout.position.length / 3; ii < il; ii += 3) {

		const t = new Triangle();

		t.setVertex(0, new Vector4(loadout.position[ii * 3], loadout.position[ii * 3 + 1], loadout.position[ii * 3 + 2]));
		t.setVertex(1, new Vector4(loadout.position[(ii + 1) * 3], loadout.position[(ii + 1) * 3 + 1], loadout.position[(ii + 1) * 3 + 2]));
		t.setVertex(2, new Vector4(loadout.position[(ii + 2) * 3], loadout.position[(ii + 2) * 3 + 1], loadout.position[(ii + 2) * 3 + 2]));

		t.setNormal(0, new Vector3(loadout.normal[ii * 3], loadout.normal[ii * 3 + 1], loadout.normal[ii * 3 + 2]));
		t.setNormal(1, new Vector3(loadout.normal[(ii + 1) * 3], loadout.normal[(ii + 1) * 3 + 1], loadout.normal[(ii + 1) * 3 + 2]));
		t.setNormal(2, new Vector3(loadout.normal[(ii + 2) * 3], loadout.normal[(ii + 2) * 3 + 1], loadout.normal[(ii + 2) * 3 + 2]));

		t.setTexCoord(0, new Vector2(loadout.uv[ii * 2], loadout.uv[ii * 2 + 1]));
		t.setTexCoord(1, new Vector2(loadout.uv[(ii + 1) * 2], loadout.uv[(ii + 1) * 2 + 1]));
		t.setTexCoord(2, new Vector2(loadout.uv[(ii + 2) * 2], loadout.uv[(ii + 2) * 2 + 1]));

		TriangleList.push(t);

	}

	const r = new Rasterizer(view.width, view.height);

	let texture_path = "hmap.jpg";
	r.set_texture(new Texture(obj_path + texture_path));

	let active_shader = phong_fragment_shader;

	const type = 'normal'; // normal phong texture displacement bump

	if (type === 'texture') {

		active_shader = texture_fragment_shader;
		texture_path = "spot_texture.png";
		r.set_texture(new Texture(obj_path + texture_path));

	} else if (type === 'normal') {

		active_shader = normal_fragment_shader;

	} else if (type === 'phong') {

		active_shader = phong_fragment_shader;

	} else if (type === 'bump') {

		active_shader = bump_fragment_shader;

	} else if (type === 'displacement') {

		active_shader = displacement_fragment_shader;

	}

	const eye_pos = new Vector3(0, 0, 10);

	r.set_vertex_shader(vertex_shader);
	r.set_fragment_shader(active_shader);

	function render(delta) {

		r.clear(Buffers.Color | Buffers.Depth);

		r.set_model(get_model_matrix(angle));
		r.set_view(get_view_matrix(eye_pos));
		r.set_projection(get_projection_matrix(45, 1, 0.1, 50));

		r.draw(TriangleList);

		view.fill(r.frame_buf);

		angle = (angle + delta * 45) % 360;

	}

	view.startRenderLoop(render);

}

export { main };
