import { Vector2 } from "./math/Vector2";
import { Vector3 } from "./math/Vector3";
import { Vector4 } from "./math/Vector4";

const _face_vertex_data_separator_pattern = /\s+/;

class OBJObject {

    private objectText = '';

    private vertices: number[] = [];
    private normals: number[] = [];
    private uvs: number[] = [];

    public position: Vector4[] = [];
    public normal: Vector3[] = [];
    public uv: Vector2[] = [];

    public constructor(

        private url: string

    ) { }

    public async parse(): Promise<OBJObject> {

        await this.requestData();

        const lines = this.objectText.split('\n');

        for (let i = 0, l = lines.length; i < l; i++) {

            const line = lines[i].trimStart();

            if (line.length === 0) {

                continue;

            }

            const lineFirstChar = line.charAt(0);

            if (lineFirstChar === '#') {

                continue;

            }

            if (lineFirstChar === 'v') {

                const data = line.split(_face_vertex_data_separator_pattern);

                switch (data[0]) {

                    case 'v':

                        this.vertices.push(

                            parseFloat(data[1]),
                            parseFloat(data[2]),
                            parseFloat(data[3]),

                        );

                        break;

                    case 'vn':

                        this.normals.push(

                            parseFloat(data[1]),
                            parseFloat(data[2]),
                            parseFloat(data[3]),

                        );

                        break;

                    case 'vt':

                        this.uvs.push(

                            parseFloat(data[1]),
                            parseFloat(data[2]),

                        );

                        break;

                }

            }

            if (lineFirstChar === 'f') {

                const lineData = line.slice(1).trim();
                const vertexData = lineData.split(_face_vertex_data_separator_pattern);
                const faceVertices = [];

                for (let j = 0, jl = vertexData.length; j < jl; j++) {

                    const vertex = vertexData[j];

                    if (vertex.length > 0) {

                        const vertexParts = vertex.split('/');
                        faceVertices.push(vertexParts);

                    }

                }

                const v1 = faceVertices[0];

                for (let j = 1, jl = faceVertices.length - 1; j < jl; j++) {

                    const v2 = faceVertices[j];
                    const v3 = faceVertices[j + 1];

                    this.addFace(
                        v1[0], v2[0], v3[0],
                        v1[1], v2[1], v3[1],
                        v1[2], v2[2], v3[2]
                    );

                }

            }

        }

        return this;

    }

    private async requestData(): Promise<void> {

        const response = await fetch(this.url);

        let text = await response.text();

        if (text.indexOf('\r\n') !== - 1) {

            text = text.replace(/\r\n/g, '\n');

        }

        if (text.indexOf('\\\n') !== - 1) {

            text = text.replace(/\\\n/g, '');

        }


        this.objectText = text;

    }

    private addFace(a: string, b: string, c: string, ua: string, ub: string, uc: string, na: string, nb: string, nc: string) {

        const vLen = this.vertices.length;

        let ia = this.parseVertexIndex(a, vLen);
        let ib = this.parseVertexIndex(b, vLen);
        let ic = this.parseVertexIndex(c, vLen);

        this.addVertex(ia, ib, ic);

        const nLen = this.normals.length;

        ia = this.parseNormalIndex(na, nLen);
        ib = this.parseNormalIndex(nb, nLen);
        ic = this.parseNormalIndex(nc, nLen);

        this.addNormal(ia, ib, ic);


        const uvLen = this.uvs.length;

        ia = this.parseUVIndex(ua, uvLen);
        ib = this.parseUVIndex(ub, uvLen);
        ic = this.parseUVIndex(uc, uvLen);

        this.addUV(ia, ib, ic);

    }

    private parseVertexIndex(value: string, len: number): number {

        const index = parseInt(value, 10);
        return (index >= 0 ? index - 1 : index + len / 3) * 3;

    }

    private parseNormalIndex(value: string, len: number): number {

        const index = parseInt(value, 10);
        return (index >= 0 ? index - 1 : index + len / 3) * 3;

    }

    private parseUVIndex(value: string, len: number): number {

        const index = parseInt(value, 10);
        return (index >= 0 ? index - 1 : index + len / 2) * 2;

    }

    private addVertex(a: number, b: number, c: number): void {

        const src = this.vertices;
        const dst = this.position;

        dst.push(new Vector4(src[a + 0], src[a + 1], src[a + 2], 1));
        dst.push(new Vector4(src[b + 0], src[b + 1], src[b + 2], 1));
        dst.push(new Vector4(src[c + 0], src[c + 1], src[c + 2], 1));

    }

    private addNormal(a: number, b: number, c: number): void {

        const src = this.normals;
        const dst = this.normal;

        dst.push(new Vector3(src[a + 0], src[a + 1], src[a + 2]));
        dst.push(new Vector3(src[b + 0], src[b + 1], src[b + 2]));
        dst.push(new Vector3(src[c + 0], src[c + 1], src[c + 2]));

    }

    private addUV(a: number, b: number, c: number): void {

        const src = this.uvs;
        const dst = this.uv;

        dst.push(new Vector2(src[a + 0], src[a + 1]));
        dst.push(new Vector2(src[b + 0], src[b + 1]));
        dst.push(new Vector2(src[c + 0], src[c + 1]));

    }

}

export class OBJLoader {

    public static async load(url: string): Promise<OBJObject> {

        return new OBJObject(url).parse();

    }

}