import { Vector3, Matrix3 } from 'three';

function main() {

	const vector3 = new Vector3(2, 1, 1);

	const matrix = new Matrix3();

	const theta = Math.PI / 4;
	const cos = Math.cos(theta);
	const sin = Math.sin(theta);

	matrix.set(
		cos, -sin, 1.0,
		sin, cos, 2.0,
		0.0, 0.0, 1.0
	)

	vector3.applyMatrix3(matrix);

	alert(`${vector3.x}\n${vector3.y}\n${vector3.z}`);

}

export { main };