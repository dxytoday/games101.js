const _face_vertex_data_separator_pattern = /\s+/;

class OBJLoader {

	async loadFile(url) {

		const response = await fetch(url);

		let text = await response.text();

		if (text.indexOf('\r\n') !== - 1) {

			text = text.replace(/\r\n/g, '\n');

		}

		if (text.indexOf('\\\n') !== - 1) {

			text = text.replace(/\\\n/g, '');

		}

		return text;

	}

	parseText(text) {

		const data = {

			position: [],
			normal: [],
			uv: [],

		};

		const vertices = [];
		const normals = [];
		const uvs = [];

		const mate = { vertices, normals, uvs };

		const lines = text.split('\n');

		for (let ii = 0, il = lines.length; ii < il; ii++) {

			const line = lines[ii].trimStart();

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

						vertices.push(

							parseFloat(data[1]),
							parseFloat(data[2]),
							parseFloat(data[3]),

						);

						break;

					case 'vn':

						normals.push(

							parseFloat(data[1]),
							parseFloat(data[2]),
							parseFloat(data[3]),

						);

						break;

					case 'vt':

						uvs.push(

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

				for (let ji = 1, jl = faceVertices.length - 1; ji < jl; ji++) {

					const v2 = faceVertices[ji];
					const v3 = faceVertices[ji + 1];

					this.parseFace(

						mate, data,

						v1[0], v2[0], v3[0],
						v1[1], v2[1], v3[1],
						v1[2], v2[2], v3[2]

					);

				}

			}

		}

		return data;

	}

	parseFace(

		mate, data,
		a, b, c,
		ua, ub, uc,
		na, nb, nc,

	) {

		const { vertices, normals, uvs } = mate;
		const { position, normal, uv } = data;

		this.parseVertex(vertices, position, a, b, c);
		this.parseNormal(normals, normal, na, nb, nc);
		this.parseUV(uvs, uv, ua, ub, uc);

	}

	parseVertex(mate, data, a, b, c) {

		const len = mate.length;

		a = this.parseVertexIndex(a, len);
		b = this.parseVertexIndex(b, len);
		c = this.parseVertexIndex(c, len);

		data.push(mate[a + 0], mate[a + 1], mate[a + 2]);
		data.push(mate[b + 0], mate[b + 1], mate[b + 2]);
		data.push(mate[c + 0], mate[c + 1], mate[c + 2]);

	}

	parseVertexIndex(value, len) {

		const index = parseInt(value, 10);
		return (index >= 0 ? index - 1 : index + len / 3) * 3;

	}

	parseNormal(mate, data, a, b, c) {

		const len = mate.length;

		if (len === 0) {

			data.push(0, 0, 0, 0, 0, 0, 0, 0, 0);
			return;

		}

		a = this.parseNormalIndex(a, len);
		b = this.parseNormalIndex(b, len);
		c = this.parseNormalIndex(c, len);

		data.push(mate[a + 0], mate[a + 1], mate[a + 2]);
		data.push(mate[b + 0], mate[b + 1], mate[b + 2]);
		data.push(mate[c + 0], mate[c + 1], mate[c + 2]);

	}

	parseNormalIndex(value, len) {

		const index = parseInt(value, 10);
		return (index >= 0 ? index - 1 : index + len / 3) * 3;

	}

	parseUV(mate, data, a, b, c) {

		const len = mate.length;

		if (len === 0) {

			data.push(0, 0, 0, 0, 0, 0);
			return;

		}

		a = this.parseUVIndex(a, len);
		b = this.parseUVIndex(b, len);
		c = this.parseUVIndex(c, len);

		data.push(mate[a + 0], mate[a + 1]);
		data.push(mate[b + 0], mate[b + 1]);
		data.push(mate[c + 0], mate[c + 1]);

	}

	parseUVIndex(value, len) {

		var index = parseInt(value, 10);
		return (index >= 0 ? index - 1 : index + len / 2) * 2;

	}

	async load(url) {

		const text = await this.loadFile(url);

		return this.parseText(text);

	}

}

export { OBJLoader };
