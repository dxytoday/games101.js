class Triangle {

	v = [];
	tex_coords = [];
	normal = [];
	color = [];

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

	setColor(ind, color) {

		color.x /= 255;
		color.y /= 255;
		color.z /= 255;

		this.color[ind] = color;

	}

	*[Symbol.iterator]() {

		yield this.v[0];
		yield this.v[1];
		yield this.v[2];

	}

}

export { Triangle };
