import { Matrix4 } from "./Matrix4";
import { Vector3 } from "./Vector3";

export class Vector4 {

    public constructor(

        public x = 0,
        public y = 0,
        public z = 0,
        public w = 1,

    ) { }

    public set(x: number, y: number, z: number, w: number): Vector4 {

        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;

        return this;

    }

    public applyMatrix(matrix: Matrix4): Vector4 {

        const [

            n11, n12, n13, n14,
            n21, n22, n23, n24,
            n31, n32, n33, n34,
            n41, n42, n43, n44,

        ] = matrix.elements;

        const x = this.x;
        const y = this.y;
        const z = this.z;
        const w = this.w;

        this.x = n11 * x + n12 * y + n13 * z + n14 * w;
        this.y = n21 * x + n22 * y + n23 * z + n24 * w;
        this.z = n31 * x + n32 * y + n33 * z + n34 * w;
        this.w = n41 * x + n42 * y + n43 * z + n44 * w;

        return this;

    }

    public divideScalar(scalar: number): Vector4 {

        this.x /= scalar;
        this.y /= scalar;
        this.z /= scalar;
        this.w /= scalar;

        return this;

    }

    public toVector3(): Vector3 {

        return new Vector3(this.x, this.y, this.z);

    }

    public fromVector3(v: Vector3, w = 1): Vector4 {

        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        this.w = w;

        return this;

    }

}