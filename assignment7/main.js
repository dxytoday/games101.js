import { OBJLoader, Vector3 } from 'three';
import { View } from 'View';

const _spp = 512;

const pixels = [];
const renderers = [];

function loadObjFiles() {

	return new Promise(

		async function (resolve) {

			const loader = new OBJLoader();

			const floor = await loader.load('./assignment7/resources/floor.obj');
			const shortbox = await loader.load('./assignment7/resources/shortbox.obj');
			const tallbox = await loader.load('./assignment7/resources/tallbox.obj');
			const left = await loader.load('./assignment7/resources/left.obj');
			const right = await loader.load('./assignment7/resources/right.obj');
			const light = await loader.load('./assignment7/resources/light.obj');

			resolve(

				{

					floor: floor.position,
					shortbox: shortbox.position,
					tallbox: tallbox.position,
					left: left.position,
					right: right.position,
					light: light.position,

				}

			);

		}

	);

}

function loadRenderers(width, height) {

	const rendererNumber = 20;

	return new Promise(

		async function (resolve) {

			const ObjData = await loadObjFiles();

			for (let ii = 0; ii < rendererNumber; ii++) {

				renderers.push(

					new Worker('../assignment7/Renderer.js', { type: 'module' })

				);

			}

			let complete = 0;

			const initData = {

				width: width,
				height: height,

				...ObjData,

			};

			for (const renderer of renderers) {

				renderer.onmessage = function () {

					renderer.onmessage = onRenderComplete;

					complete++;

					if (complete === renderers.length) {

						resolve();

					}

				}

				renderer.postMessage({ type: 'init', data: initData });

			}

		}

	);

}

function render(camera, spp = 1) {

	const unit = 500;
	let count = 0;

	let complete = 0;

	function workerMessage(event) {

		if (event.data.type !== 'finished') {

			onRenderComplete(event);

			return;

		}

		const worker = event.srcElement;

		if (count >= pixels.length) {

			complete++;

			if (complete === renderers.length) {

				if (spp !== _spp) {

					render(camera, _spp);

				} else {

					// 渲染结束

				}

			}

			return;

		}

		const start = count;
		const end = Math.min(pixels.length, count += unit);

		worker.postMessage({

			type: 'render',
			spp: spp,
			start: start,
			end: end,

		});

	}

	for (const renderer of renderers) {

		renderer.onmessage = workerMessage;

		workerMessage({ data: { type: 'finished' }, srcElement: renderer });

	}

}

function onRenderComplete({ data }) {

	pixels[data.index].copy(data.color);

}

async function main() {

	const view = new View();

	const { width, height } = view;

	await loadRenderers(width, height);

	for (let ii = 0, il = width * height; ii < il; ii++) {

		pixels.push(new Vector3());

	}

	render();

	view.startRenderLoop(

		function () {

			view.fill(pixels);

		}

	);

}

export { main };
