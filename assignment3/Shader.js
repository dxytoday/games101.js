import { Matrix4, Vector2, Vector3, Vector4 } from 'three';

class vertex_shader_payload {

	model = new Matrix4();
	view = new Matrix4();
	projection = new Matrix4();

	position = new Vector4();
	normal = new Vector3();
	mvPosition = new Vector3();

}

class fragment_shader_payload {

	mvPosition = undefined;
	normal = undefined;
	uv = undefined;
	texture = undefined;

	color = new Vector3(255, 255, 255);

}

export { vertex_shader_payload, fragment_shader_payload };
