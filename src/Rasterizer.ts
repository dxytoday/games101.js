import { Triangle } from "./Triangle";
import { Matrix4 } from "./math/Matrix4";
import { Vector3 } from "./math/Vector3";
import { Vector4 } from "./math/Vector4";

type pos_buf_id = {

    pos_id: number;

};

type ind_buf_id = {

    ind_id: number;

};

type col_buf_id = {

    col_id: number;

};

export enum Buffers {

    Color = 1,
    Depth = 2,

}

export enum Primitive {

    Line,
    Triangle,

}

function insideTriangle(x: number, y: number, _v: Vector3[]): boolean {

    const p = new Vector3(x, y, 0);

    let flag: number | undefined;

    for (let ii = 0; ii < 3; ii++) {

        const currP = _v[ii];
        const nextP = _v[(ii + 1) % 3];

        const l1 = new Vector3().subVectors(currP, p);
        const l2 = new Vector3().subVectors(currP, nextP);

        const cp = new Vector3().crossVectors(l1, l2);

        if (cp.z === 0) {

            continue;

        }

        const sign = cp.z < 0 ? 0 : 1;

        if (flag === undefined) {

            flag = sign;

        }

        if (flag !== sign) {

            return false;

        }

    }

    return true;

}

function computeBarycentric2D(x: number, y: number, v: Vector3[]): [number, number, number] {

    const c1 = (x * (v[1].y - v[2].y) + (v[2].x - v[1].x) * y + v[1].x * v[2].y - v[2].x * v[1].y) / (v[0].x * (v[1].y - v[2].y) + (v[2].x - v[1].x) * v[0].y + v[1].x * v[2].y - v[2].x * v[1].y);
    const c2 = (x * (v[2].y - v[0].y) + (v[0].x - v[2].x) * y + v[2].x * v[0].y - v[0].x * v[2].y) / (v[1].x * (v[2].y - v[0].y) + (v[0].x - v[2].x) * v[1].y + v[2].x * v[0].y - v[0].x * v[2].y);
    const c3 = (x * (v[0].y - v[1].y) + (v[1].x - v[0].x) * y + v[0].x * v[1].y - v[1].x * v[0].y) / (v[2].x * (v[0].y - v[1].y) + (v[1].x - v[0].x) * v[2].y + v[0].x * v[1].y - v[1].x * v[0].y);

    return [c1, c2, c3];
}

export class Rasterizer {

    private readonly buffers: { [key: number]: Vector3[] } = {};

    public readonly frame_buf = new Array<Vector3>();
    private readonly depth_buf = new Array<number>();

    private model: Matrix4 = new Matrix4();
    private view: Matrix4 = new Matrix4();
    private projection: Matrix4 = new Matrix4();

    public constructor(

        private width: number,
        private height: number,

    ) {

        for (let ii = 0, li = width * height; ii < li; ii++) {

            this.frame_buf[ii] = new Vector3();
            this.depth_buf[ii] = Infinity;

        }

    }

    private get_next_id(): number {

        return Object.keys(this.buffers).length;

    }

    public load_positions(vectors: Vector3[]): pos_buf_id {

        const id = this.get_next_id();

        this.buffers[id] = vectors;

        return { pos_id: id };

    }

    public load_colors(vectors: Vector3[]): col_buf_id {

        const id = this.get_next_id();

        this.buffers[id] = vectors;

        return { col_id: id };

    }

    public load_indices(vectors: Vector3[]): ind_buf_id {

        const id = this.get_next_id();

        this.buffers[id] = vectors;

        return { ind_id: id };

    }

    public clear(buffer: Buffers): void {

        if ((buffer & Buffers.Color) === Buffers.Color) {

            this.frame_buf.forEach(v => v.set(0, 0, 0));

        }

        if ((buffer & Buffers.Depth) === Buffers.Depth) {

            this.depth_buf.fill(Infinity);

        }

    }

    public set_model(matrix: Matrix4): void {

        this.model = matrix;

    }

    public set_view(matrix: Matrix4): void {

        this.view = matrix;

    }

    public set_projection(matrix: Matrix4): void {

        this.projection = matrix;

    }

    public draw(pos_buffer: pos_buf_id, ind_buffer: ind_buf_id, col_buffer: col_buf_id, type: Primitive): void {

        const buf = this.buffers[pos_buffer.pos_id];
        const ind = this.buffers[ind_buffer.ind_id];
        const col = this.buffers[col_buffer.col_id];

        const f1 = (50 - 0.1) / 2;
        const f2 = (50 + 0.1) / 2;

        const mvp = new Matrix4();
        mvp.multiplyMatrices(this.view, this.model);
        mvp.multiplyMatrices(this.projection, mvp);

        for (const i of ind) {

            const t = new Triangle();

            // 执行 mvp 变换
            const v = [

                new Vector4().fromVector3(buf[i.x]).applyMatrix(mvp),
                new Vector4().fromVector3(buf[i.y]).applyMatrix(mvp),
                new Vector4().fromVector3(buf[i.z]).applyMatrix(mvp),

            ]

            // 齐次除法
            for (const vert of v) {

                vert.divideScalar(vert.w);

            }

            // 视口变换
            for (const vert of v) {

                vert.x = 0.5 * this.width * (vert.x + 1);
                vert.y = 0.5 * this.height * (vert.y + 1);
                vert.z = vert.z * f1 + f2;

            }

            for (let i = 0; i < 3; i++) {

                t.setVertex(i, v[i].toVector3());

            }

            const col_x = col[i.x];
            const col_y = col[i.y];
            const col_z = col[i.z];

            t.setColor(0, col_x);
            t.setColor(1, col_y);
            t.setColor(2, col_z);

            this.rasterize_triangle(t);

        }

    }

    private rasterize_triangle(t: Triangle): void {

        const v = t.v;

        const min_x = Math.floor(Math.min(v[0].x, v[1].x, v[2].x));
        const min_y = Math.floor(Math.min(v[0].y, v[1].y, v[2].y));
        const max_x = Math.floor(Math.max(v[0].x, v[1].x, v[2].x));
        const max_y = Math.floor(Math.max(v[0].y, v[1].y, v[2].y));

        for (let x = min_x; x < max_x; x++) {

            for (let y = min_y; y < max_y; y++) {

                if (!insideTriangle(x + 0.5, y + 0.5, v)) {

                    continue;

                }

                const ind = this.get_index(x, y);

                const [alpha, beta, gamma] = computeBarycentric2D(x + 0.5, y + 0.5, t.v);

                const z_interpolated = alpha * v[0].z + beta * v[1].z + gamma * v[2].z;

                if (z_interpolated >= this.depth_buf[ind]) {

                    continue;

                }

                this.set_pixel(ind, t.getColor());

                this.depth_buf[ind] = z_interpolated;

            }

        }

    }

    private get_index(x: number, y: number): number {

        return (this.height - 1 - y) * this.width + x;

    }

    private set_pixel(ind: number, color: Vector3): void {

        this.frame_buf[ind].copy(color);

    }

}