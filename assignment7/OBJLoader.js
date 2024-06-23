import * as THREE from '../math/three.js';

const _face_vertex_data_separator_pattern = /\s+/;

class OBJObject {

	objectText = '';

	vertices = [];
	normals = [];
	uvs = [];

	positions = [];

	constructor(url) {

		this.url = url;

	}

	async parse() {

		await this.requestData();

		const lines = this.objectText.split('\n');

		for (let i = 0, l = lines.length; i < l; i++) {

			const line = lines[i].trimStart();

			if (line.length === 0) {

				continue;

			}

			const lineFirstChar = line.charAt(0);

			if (lineFirstChar === '#') {

				continue;

			}

			if (lineFirstChar === 'v') {

				const data = line.split(_face_vertex_data_separator_pattern);

				switch (data[0]) {

					case 'v':

						this.vertices.push(

							parseFloat(data[1]),
							parseFloat(data[2]),
							parseFloat(data[3]),

						);

						break;

					case 'vn':

						this.normals.push(

							parseFloat(data[1]),
							parseFloat(data[2]),
							parseFloat(data[3]),

						);

						break;

					case 'vt':

						this.uvs.push(

							parseFloat(data[1]),
							parseFloat(data[2]),

						);

						break;

				}

			}

			if (lineFirstChar === 'f') {

				const lineData = line.slice(1).trim();
				const vertexData = lineData.split(_face_vertex_data_separator_pattern);
				const faceVertices = [];

				for (let j = 0, jl = vertexData.length; j < jl; j++) {

					const vertex = vertexData[j];

					if (vertex.length > 0) {

						const vertexParts = vertex.split('/');
						faceVertices.push(vertexParts);

					}

				}

				const v1 = faceVertices[0];

				for (let j = 1, jl = faceVertices.length - 1; j < jl; j++) {

					const v2 = faceVertices[j];
					const v3 = faceVertices[j + 1];

					this.addFace(
						v1[0], v2[0], v3[0],
						v1[1], v2[1], v3[1],
						v1[2], v2[2], v3[2]
					);

				}

			}

		}

		return this;

	}

	async requestData() {

		const response = await fetch(this.url);

		let text = await response.text();

		if (text.indexOf('\r\n') !== - 1) {

			text = text.replace(/\r\n/g, '\n');

		}

		if (text.indexOf('\\\n') !== - 1) {

			text = text.replace(/\\\n/g, '');

		}


		this.objectText = text;

	}

	addFace(a, b, c, ua, ub, uc, na, nb, nc) {

		const vLen = this.vertices.length;

		let ia = this.parseVertexIndex(a, vLen);
		let ib = this.parseVertexIndex(b, vLen);
		let ic = this.parseVertexIndex(c, vLen);

		this.setVertex(ia, ib, ic);

	}

	parseVertexIndex(value, len) {

		const index = parseInt(value, 10);
		return (index >= 0 ? index - 1 : index + len / 3) * 3;

	}

	parseNormalIndex(value, len) {

		const index = parseInt(value, 10);
		return (index >= 0 ? index - 1 : index + len / 3) * 3;

	}

	parseUVIndex(value, len) {

		const index = parseInt(value, 10);
		return (index >= 0 ? index - 1 : index + len / 2) * 2;

	}

	setVertex(a, b, c) {

		const src = this.vertices;
		const t = this.positions;

		t.push(new THREE.Vector3(src[a + 0], src[a + 1], src[a + 2]));
		t.push(new THREE.Vector3(src[b + 0], src[b + 1], src[b + 2]));
		t.push(new THREE.Vector3(src[c + 0], src[c + 1], src[c + 2]));

	}

	setNormal(t, a, b, c) {

		const src = this.normals;

		t.setNormal(0, src[a + 0], src[a + 1], src[a + 2]);
		t.setNormal(1, src[b + 0], src[b + 1], src[b + 2]);
		t.setNormal(2, src[c + 0], src[c + 1], src[c + 2]);

	}

	setUV(t, a, b, c) {

		const src = this.uvs;

		t.setUV(0, src[a + 0], src[a + 1]);
		t.setUV(1, src[b + 0], src[b + 1]);
		t.setUV(2, src[c + 0], src[c + 1]);

	}

}

export class OBJLoader {

	static async load(url) {

		return new OBJObject(url).parse();

	}

}