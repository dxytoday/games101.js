import { Vector3 } from "./math/Vector3";
import { Vector4 } from "./math/Vector4";

export class Triangle {

    public v = new Array<Vector3>();
    public color = new Array<Vector3>();

    public setVertex(ind: number, ver: Vector3): void {

        this.v[ind] = ver;

    }

    public setColor(ind: number, col: Vector3): void {

        this.color[ind] = col;

    }

    public getColor(): Vector3 {

        return this.color[0];

    }

}