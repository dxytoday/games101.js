import { Vector2 } from "./math/Vector2";
import { Vector3 } from "./math/Vector3";
import { Vector4 } from "./math/Vector4";

export class Triangle {

    public v = new Array<Vector4>();
    public color = new Array<Vector3>();
    public tex_coords = new Array<Vector2>();
    public normal = new Array<Vector3>();

    public setVertex(ind: number, ver: Vector4): void {

        this.v[ind] = ver;

    }

    public setColor(ind: number, col: Vector3): void {

        col.divideScalar(255);

        this.color[ind] = col;

    }

    public setNormal(ind: number, n: Vector3): void {

        this.normal[ind] = n;

    }

    public setTexCoord(ind: number, uv: Vector2): void {

        this.tex_coords[ind] = uv;

    }

}
