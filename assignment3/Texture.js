import { Vector3 } from 'three';

class Texture {

	imageData = undefined;

	width = 0;
	height = 0;

	constructor(name) {

		const img = document.createElement('img');

		img.onload = () => {

			const canvas = document.createElement('canvas');

			canvas.width = img.width;
			canvas.height = img.height;

			const context = canvas.getContext('2d');

			context.drawImage(img, 0, 0, img.width, img.height);

			this.imageData = context.getImageData(0, 0, img.width, img.height);

			this.width = img.width;
			this.height = img.height;

		}

		img.src = name;

	}

	readPixel(x, y, target = new Vector3()) {

		if (!this.imageData) {

			return target;

		}

		const index = ((this.height - 1 - y) * this.width + x) * 4;

		target.x = this.imageData.data[index];
		target.y = this.imageData.data[index + 1];
		target.z = this.imageData.data[index + 2];

		return target;

	}

	getColor(u, v, target) {

		const x = Math.round(u * this.width);
		const y = Math.round(v * this.height);

		this.readPixel(x, y, target);

		return target;

	}

	getColorBilinear(u, v, target) {

		u = u * this.width;
		v = v * this.height;

		const u0 = Math.floor(u);
		const v0 = Math.floor(v);

		const u1 = Math.min(Math.ceil(u), this.width);
		const v1 = Math.min(Math.ceil(v), this.height);

		const us = u % 1;
		const vs = v % 1;

		const p00 = this.readPixel(u0, v0);
		const p01 = this.readPixel(u0, v1);
		const p10 = this.readPixel(u1, v0);
		const p11 = this.readPixel(u1, v1);

		p00.lerp(p01, vs);
		p10.lerp(p11, vs);

		return target.lerpVectors(p00, p10, us);

	}

}

export { Texture };
