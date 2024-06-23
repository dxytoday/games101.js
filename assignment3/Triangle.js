class Triangle {

	v = [];
	tex_coords = [];
	normal = [];

	mv = [];

	setVertex(ind, ver) {

		this.v[ind] = ver;

	}

	setNormal(ind, n) {

		this.normal[ind] = n;

	}

	setTexCoord(ind, uv) {

		this.tex_coords[ind] = uv;

	}

	*[Symbol.iterator]() {

		yield this.v[0];
		yield this.v[1];
		yield this.v[2];

	}

}

export { Triangle };
