import { fragment_shader_payload, vertex_shader_payload } from "./Shader";
import { Texture } from "./Texture";
import { Triangle } from "./Triangle";
import { Matrix4 } from "./math/Matrix4";
import { Vector2 } from "./math/Vector2";
import { Vector3 } from "./math/Vector3";
import { Vector4 } from "./math/Vector4";

type VertexShader = (paylod: vertex_shader_payload) => Vector3;
type FragmentShader = (paylod: fragment_shader_payload) => Vector3;

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

function insideTriangle(x: number, y: number, _v: Vector4[]): boolean {

    const p = new Vector3(x, y, 0);

    let flag: number | undefined;

    const l1 = new Vector3()
    const l2 = new Vector3()
    const cp = new Vector3()

    for (let ii = 0; ii < 3; ii++) {

        const currP = _v[ii].toVector3();
        const nextP = _v[(ii + 1) % 3].toVector3();

        l1.subVectors(currP, p);
        l2.subVectors(currP, nextP);

        cp.crossVectors(l1, l2);

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

function computeBarycentric2D(x: number, y: number, v: Vector3[] | Vector4[]): [number, number, number] {

    const c1 = (x * (v[1].y - v[2].y) + (v[2].x - v[1].x) * y + v[1].x * v[2].y - v[2].x * v[1].y) / (v[0].x * (v[1].y - v[2].y) + (v[2].x - v[1].x) * v[0].y + v[1].x * v[2].y - v[2].x * v[1].y);
    const c2 = (x * (v[2].y - v[0].y) + (v[0].x - v[2].x) * y + v[2].x * v[0].y - v[0].x * v[2].y) / (v[1].x * (v[2].y - v[0].y) + (v[0].x - v[2].x) * v[1].y + v[2].x * v[0].y - v[0].x * v[2].y);
    const c3 = (x * (v[0].y - v[1].y) + (v[1].x - v[0].x) * y + v[0].x * v[1].y - v[1].x * v[0].y) / (v[2].x * (v[0].y - v[1].y) + (v[1].x - v[0].x) * v[2].y + v[0].x * v[1].y - v[1].x * v[0].y);

    return [c1, c2, c3];
}

function to_vec4(v: Vector3, w: number): Vector4 {

    return new Vector4().fromVector3(v, w);

}


function interpolate_v3(alpha: number, beta: number, gamma: number, vert1: Vector3, vert2: Vector3, vert3: Vector3, weight: number): Vector3 {

    const result = new Vector3();

    const v = new Vector3();

    result.add(v.copy(vert1).multiplyScalar(alpha));
    result.add(v.copy(vert2).multiplyScalar(beta));
    result.add(v.copy(vert3).multiplyScalar(gamma));
    result.multiplyScalar(1 / weight);

    return result;

}

function interpolate_v2(alpha: number, beta: number, gamma: number, vert1: Vector2, vert2: Vector2, vert3: Vector2, weight: number) {

    const result = new Vector2();

    const v = new Vector2();

    result.add(v.copy(vert1).multiplyScalar(alpha));
    result.add(v.copy(vert2).multiplyScalar(beta));
    result.add(v.copy(vert3).multiplyScalar(gamma));
    result.multiplyScalar(1 / weight);

    return result;

}


export class Rasterizer {

    private readonly buffers: { [key: number]: Vector3[] } = {};

    public readonly frame_buf = new Array<Vector3>();
    private readonly depth_buf = new Array<number>();

    private model: Matrix4 = new Matrix4();
    private view: Matrix4 = new Matrix4();
    private projection: Matrix4 = new Matrix4();

    private texture: Texture | undefined;

    private vertex_shader = (paylod: vertex_shader_payload) => new Vector3();
    private fragment_shader = (paylod: fragment_shader_payload) => new Vector3();

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

    public draw(TriangleList: Triangle[]): void {

        const f1 = (50 - 0.1) / 2;
        const f2 = (50 + 0.1) / 2;

        const mv = new Matrix4();
        const mvp = new Matrix4();
        mv.multiplyMatrices(this.view, this.model);
        mvp.multiplyMatrices(this.projection, mv);

        const inv_trans = mv.clone();
        inv_trans.invert().transpose();

        for (const t of TriangleList) {

            const newtri = new Triangle();

            newtri.tex_coords[0] = t.tex_coords[0];
            newtri.tex_coords[1] = t.tex_coords[1];
            newtri.tex_coords[2] = t.tex_coords[2];

            const mm: Vector4[] = [

                t.v[0].clone().applyMatrix(mv),
                t.v[1].clone().applyMatrix(mv),
                t.v[2].clone().applyMatrix(mv),

            ]

            const viewspace_pos: Vector3[] = mm.map(v => v.toVector3());

            const v = [

                t.v[0].clone().applyMatrix(mvp),
                t.v[1].clone().applyMatrix(mvp),
                t.v[2].clone().applyMatrix(mvp),

            ]

            // 齐次除法
            for (const vert of v) {

                vert.x /= vert.w;
                vert.y /= vert.w;
                vert.z /= vert.w;

            }

            const n: Vector4[] = [

                to_vec4(t.normal[0], 0).applyMatrix(inv_trans),
                to_vec4(t.normal[1], 0).applyMatrix(inv_trans),
                to_vec4(t.normal[2], 0).applyMatrix(inv_trans),

            ];

            // 视口变换
            for (const vert of v) {

                vert.x = 0.5 * this.width * (vert.x + 1);
                vert.y = 0.5 * this.height * (vert.y + 1);
                vert.z = vert.z * f1 + f2;

            }

            for (let i = 0; i < 3; i++) {

                newtri.setVertex(i, v[i]);

            }

            for (let i = 0; i < 3; ++i) {

                newtri.setNormal(i, n[i].toVector3());

            }

            newtri.setColor(0, new Vector3(148, 121, 92));
            newtri.setColor(1, new Vector3(148, 121, 92));
            newtri.setColor(2, new Vector3(148, 121, 92));

            this.rasterize_triangle(newtri, viewspace_pos);

        }

    }

    // 屏幕空间光栅化
    private rasterize_triangle(t: Triangle, view_pos: Vector3[]): void {

        const v = t.v;

        const min_x = Math.round(Math.min(v[0].x, v[1].x, v[2].x));
        const min_y = Math.round(Math.min(v[0].y, v[1].y, v[2].y));
        const max_x = Math.round(Math.max(v[0].x, v[1].x, v[2].x));
        const max_y = Math.round(Math.max(v[0].y, v[1].y, v[2].y));

        for (let x = min_x; x < max_x; x++) {

            for (let y = min_y; y < max_y; y++) {

                if (!insideTriangle(x + 0.5, y + 0.5, v)) {

                    continue;

                }

                const [alpha, beta, gamma] = computeBarycentric2D(x + 0.5, y + 0.5, t.v);

                const Z = 1.0 / (alpha / v[0].w + beta / v[1].w + gamma / v[2].w);
                let zp = alpha * v[0].z / v[0].w + beta * v[1].z / v[1].w + gamma * v[2].z / v[2].w;
                zp *= Z;

                const ind = this.get_index(x, y);

                if (zp >= this.depth_buf[ind]) {

                    continue;

                }

                this.depth_buf[ind] = zp;

                const interpolated_color = interpolate_v3(alpha, beta, gamma, t.color[0], t.color[1], t.color[2], 1);
                const interpolated_normal = interpolate_v3(alpha, beta, gamma, t.normal[0], t.normal[1], t.normal[2], 1);
                const interpolated_texcoords = interpolate_v2(alpha, beta, gamma, t.tex_coords[0], t.tex_coords[1], t.tex_coords[2], 1);
                const interpolated_shadingcoords = interpolate_v3(alpha, beta, gamma, view_pos[0], view_pos[1], view_pos[2], 1);

                const payload = new fragment_shader_payload(interpolated_color, interpolated_normal, interpolated_texcoords, this.texture);
                payload.view_pos = interpolated_shadingcoords;

                const pixel_color = this.fragment_shader(payload);

                this.set_pixel(ind, pixel_color);

            }

        }

    }

    private get_index(x: number, y: number): number {

        return (this.height - 1 - y) * this.width + x;

    }

    private set_pixel(ind: number, color: Vector3): void {

        this.frame_buf[ind].copy(color);

    }

    public set_texture(tex: Texture): void {

        this.texture = tex;

    }

    public set_vertex_shader(vert_shader: VertexShader): void {

        this.vertex_shader = vert_shader;

    }

    public set_fragment_shader(frag_shader: FragmentShader): void {

        this.fragment_shader = frag_shader;

    }

}