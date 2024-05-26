import { OBJLoader } from "./OBJLoader";
import { Buffers, Primitive, Rasterizer } from "./Rasterizer";
import { fragment_shader_payload, vertex_shader_payload } from "./Shader";
import { Texture } from "./Texture";
import { Triangle } from "./Triangle";
import { Matrix4 } from "./math/Matrix4";
import { Vector3 } from "./math/Vector3";

let context: CanvasRenderingContext2D;
let image: ImageData;

type light = {

	position: Vector3;
	intensity: Vector3;

};

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

function get_model_matrix(angle: number): Matrix4 {

	const model = new Matrix4();

	const theta = angle / 180 * Math.PI;
	const cos = Math.cos(theta);
	const sin = Math.sin(theta);

	model.set(

		cos, 0, sin, 0,
		0, 1, 0, 0,
		-sin, 0, cos, 0,
		0, 0, 0, 1

	);

	const s = 3;
	const scale = new Matrix4(
		[
			s, 0, 0, 0,
			0, s, 0, 0,
			0, 0, s, 0,
			0, 0, 0, 1
		]
	);

	return model.multiplyMatrices(model, scale);

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

function vertex_shader(payload: vertex_shader_payload): Vector3 {

	return payload.position || new Vector3();

}

function phong_fragment_shader(payload: fragment_shader_payload): Vector3 {

	const ka = new Vector3(0.005, 0.005, 0.005);
	const kd = payload.color as Vector3;
	const ks = new Vector3(0.7937, 0.7937, 0.7937);

	const l1: light = { position: new Vector3(20, 20, 20), intensity: new Vector3(500, 500, 500) };
	const l2: light = { position: new Vector3(-20, 20, 0), intensity: new Vector3(500, 500, 500) };

	const lights: light[] = [l1, l2];

	const amb_light_intensity = new Vector3(10, 10, 10);
	const eye_pos = new Vector3(0, 0, 10);

	const p = 150; // 光斑集中系数

	const color = payload.color as Vector3;
	const point = payload.view_pos as Vector3;
	const normal = payload.normal as Vector3;

	const result_color = new Vector3(0, 0, 0);

	for (const light of lights) {

		const light_pos = light.position;

		const L = light_pos.clone().sub(point).normalize();
		const V = eye_pos.clone().sub(point).normalize();
		const H = L.clone().add(V).normalize();
		const N = normal.normalize();

		const NoL = Math.max(0, N.dot(L));
		const NoH = Math.max(0, N.dot(H));

		const distanceSq = light_pos.sub(point).lengthSq();
		const intensity = light.intensity.divideScalar(distanceSq);

		const ambient = ka.clone().multiply(amb_light_intensity);

		const diffuse = kd.clone().multiply(intensity).multiplyScalar(NoL);

		const specular = ks.clone().multiply(intensity).multiplyScalar(Math.pow(NoH, p));

		result_color.add(ambient).add(diffuse).add(specular);

	}

	return result_color.multiplyScalar(255);

}

function normal_fragment_shader(payload: fragment_shader_payload): Vector3 {

	const normal = payload.normal as Vector3;
	normal.normalize();
	normal.addScalar(1);
	normal.divideScalar(2);
	normal.multiplyScalar(255);

	return normal;

}

function texture_fragment_shader(payload: fragment_shader_payload): Vector3 {

	return payload.color || new Vector3(255, 255, 255);

}

function displacement_fragment_shader(payload: fragment_shader_payload): Vector3 {

	return payload.color || new Vector3(255, 255, 255);

}

function bump_fragment_shader(payload: fragment_shader_payload): Vector3 {

	return payload.color || new Vector3(255, 255, 255);

}

export async function main(canvas: HTMLCanvasElement): Promise<void> {

	const TriangleList: Triangle[] = [];

	let angle = 140;

	const obj_path = "./resources/";

	const objObject = await OBJLoader.load('./resources/spot_triangulated_good.obj');

	for (let ii = 0, li = objObject.position.length; ii < li; ii += 3) {

		const t = new Triangle();

		for (let ji = 0; ji < 3; ji++) {

			t.setVertex(ji, objObject.position[ii + ji]);
			t.setNormal(ji, objObject.normal[ii + ji]);
			t.setTexCoord(ji, objObject.uv[ii + ji]);

		}

		TriangleList.push(t);

	}

	const r = new Rasterizer(canvas.width, canvas.height);

	let texture_path = "hmap.jpg";

	r.set_texture(await Texture.load(obj_path + texture_path))

	// phong
	let active_shader = phong_fragment_shader;

	// normal
	{
		// active_shader = normal_fragment_shader;
	}

	// if (argc >= 2) {
	// 	command_line = true;
	// 	filename = std:: string(argv[1]);

	// 	if (argc == 3 && std:: string(argv[2]) == "texture")
	// 	{
	// 		std:: cout << "Rasterizing using the texture shader\n";
	// 		active_shader = texture_fragment_shader;
	// 		texture_path = "spot_texture.png";
	// 		r.set_texture(Texture(obj_path + texture_path));
	// 	}
	// 		else if (argc == 3 && std:: string(argv[2]) == "normal")
	// 	{
	// 		std:: cout << "Rasterizing using the normal shader\n";
	// 		active_shader = normal_fragment_shader;
	// 	}
	// 		else if (argc == 3 && std:: string(argv[2]) == "phong")
	// 	{
	// 		std:: cout << "Rasterizing using the phong shader\n";
	// 		active_shader = phong_fragment_shader;
	// 	}
	// 		else if (argc == 3 && std:: string(argv[2]) == "bump")
	// 	{
	// 		std:: cout << "Rasterizing using the bump shader\n";
	// 		active_shader = bump_fragment_shader;
	// 	}
	// 		else if (argc == 3 && std:: string(argv[2]) == "displacement")
	// 	{
	// 		std:: cout << "Rasterizing using the bump shader\n";
	// 		active_shader = displacement_fragment_shader;
	// 	}
	// }

	const eye_pos = new Vector3(0, 0, 10);

	r.set_vertex_shader(vertex_shader);
	r.set_fragment_shader(active_shader);

	function render(): void {

		requestAnimationFrame(render); // 循环调用

		r.clear(Buffers.Color | Buffers.Depth);

		angle = (angle + 1) % 360;

		r.set_model(get_model_matrix(angle));
		r.set_view(get_view_matrix(eye_pos));
		r.set_projection(get_projection_matrix(45, 1, 0.1, 50));

		r.draw(TriangleList);

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