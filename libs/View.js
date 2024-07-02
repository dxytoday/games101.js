import { Vector3 } from './Vector3.js';

const _2PI = 2 * Math.PI;
const _DIVIDE4 = 1 / 4;
const _DIVIDE1000 = 1 / 1000;

/** 显示画面 */
class View {

	canvas = undefined;
	context = undefined;

	width = 0;
	height = 0;

	imageData = undefined;
	pixels = undefined;

	canvas = undefined;

	key = undefined;

	constructor(canvas) {

		this.canvas = canvas || document.getElementById('view');
		this.context = this.canvas.getContext('2d', { willReadFrequently: true });

		this.width = this.canvas.width;
		this.height = this.canvas.height;

		this.imageData = this.context.getImageData(0, 0, this.width, this.height);
		this.pixels = this.imageData.data;

		window.onkeydown = (event) => this.key = event.key;
		window.onkeyup = () => this.key = undefined;

		this.clear();

	}

	/** 清空画布 */
	clear() {

		this.context.fillStyle = 'black';
		this.context.fillRect(0, 0, this.width, this.height);

	}

	/** 填充画布 */
	fill(colors) {

		for (let ii = 0, il = this.pixels.length; ii < il; ii += 4) {

			const color = colors[ii * _DIVIDE4];

			if (!color) {

				continue;

			}

			this.pixels[ii] = color.x * 255;
			this.pixels[ii + 1] = color.y * 255;
			this.pixels[ii + 2] = color.z * 255;
			this.pixels[ii + 3] = 255;

		}

		this.context.putImageData(this.imageData, 0, 0);

	}

	/** 绘制点 */
	point(coord, size, color) {

		this.context.fillStyle = `rgb( ${color.x * 255}, ${color.y * 255}, ${color.z * 255} )`;

		this.context.beginPath();

		this.context.arc(coord.x, coord.y, size, 0, _2PI);

		this.context.fill();

	}

	/** 绘制线段 */
	line(start, end, width, color) {

		this.context.strokeStyle = `rgb( ${color.x * 255}, ${color.y * 255}, ${color.z * 255} )`;
		this.context.lineWidth = width;

		this.context.beginPath();

		this.context.moveTo(start.x, start.y);
		this.context.lineTo(end.x, end.y);

		this.context.stroke();

	}

	/** 读取像素 */
	readPixel(coord, target = new Vector3()) {

		const imageData = this.context.getImageData(coord.x, coord.y, 1, 1);
		const pixels = imageData.data;

		target.x = pixels[0] / 255;
		target.y = pixels[1] / 255;
		target.z = pixels[2] / 255;

		return target;

	}

	/** 绘制像素 */
	drawPixel(coord, color) {

		this.context.fillStyle = `rgb( ${color.x * 255}, ${color.y * 255}, ${color.z * 255} )`;

		this.context.fillRect(coord.x, coord.y, 1, 1);

	}

	/** 注册点击事件 */
	setMouseCallback(eventCallback) {

		this.canvas.onclick = eventCallback;

	}

	/** 开始一个新的渲染循环 */
	startRenderLoop(frameCallback) {

		let elapsed = 0;
		let delta = 0;

		function render(time) {

			time *= _DIVIDE1000;
			delta = time - elapsed;
			elapsed = time;

			delta = Math.min(delta, 0.1);

			frameCallback(delta);

			requestAnimationFrame(render);

		}

		render(0);

	}

}

export { View };
