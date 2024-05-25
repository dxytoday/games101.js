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

    // TODO : Implement this function to check if the point (x, y) is inside the triangle represented by _v[0], _v[1], _v[2]

    return false;

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

    // 屏幕空间光栅化
    private rasterize_triangle(t: Triangle): void {

        const v = t.v;

        // TODO : Find out the bounding box of current triangle.
        // iterate through the pixel and find if the current pixel is inside the triangle

        // If so, use the following code to get the interpolated z value.
        //auto[alpha, beta, gamma] = computeBarycentric2D(x, y, t.v);
        //float w_reciprocal = 1.0/(alpha / v[0].w() + beta / v[1].w() + gamma / v[2].w());
        //float z_interpolated = alpha * v[0].z() / v[0].w() + beta * v[1].z() / v[1].w() + gamma * v[2].z() / v[2].w();
        //z_interpolated *= w_reciprocal;

        // TODO : set the current pixel (use the set_pixel function) to the color of the triangle (use getColor function) if it should be painted.

    }

    private get_index(x: number, y: number): number {

        return (this.height - 1 - y) * this.width + x;

    }

    private set_pixel(ind: number, color: Vector3): void {

        this.frame_buf[ind].copy(color);

    }

}