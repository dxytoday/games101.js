class Triangle {

	v = [];
	color = [];

	setVertex(ind, ver) {

		this.v[ind] = ver;

	}

	setColor(ind, col) {

		this.color[ind] = col;

	}

	getColor(ind) {

		return this.color[ind];

	}

}

export { Triangle };