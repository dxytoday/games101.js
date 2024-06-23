class Triangle {

	v = [];

	get a() { return this.v[0]; }
	get b() { return this.v[1]; }
	get c() { return this.v[2]; }

	setVertex(ind, ver) {

		this.v[ind] = ver;

	}

}

export { Triangle };