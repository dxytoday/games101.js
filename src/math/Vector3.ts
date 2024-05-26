export class Vector3 {

    public constructor(

        public x = 0,
        public y = 0,
        public z = 0,

    ) { }

    public set(x: number, y: number, z: number): Vector3 {

        this.x = x;
        this.y = y;
        this.z = z;

        return this;

    }

    public add(v: Vector3): Vector3 {

        this.x += v.x;
        this.y += v.y;
        this.z += v.z;

        return this;

    }

    public sub(v: Vector3): Vector3 {

        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;

        return this;

    }

    public multiply(v: Vector3): Vector3 {

        this.x *= v.x;
        this.y *= v.y;
        this.z *= v.z;

        return this;

    }

    public divide(v: Vector3): Vector3 {

        this.x /= v.x;
        this.y /= v.y;
        this.z /= v.z;

        return this;

    }

    public divideScalar(scalar: number): Vector3 {

        this.x /= scalar;
        this.y /= scalar;
        this.z /= scalar;

        return this;

    }

    public addScalar(scalar: number): Vector3 {

        this.x += scalar;
        this.y += scalar;
        this.z += scalar;

        return this;

    }

    public subVectors(l: Vector3, r: Vector3): Vector3 {

        this.x = l.x - r.x;
        this.y = l.y - r.y;
        this.z = l.z - r.z;

        return this;

    }

    public multiplyScalar(scalar: number): Vector3 {

        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;

        return this;

    }

    public crossVectors(l: Vector3, r: Vector3): Vector3 {

        this.x = l.y * r.z - l.z * r.y;
        this.y = l.z * r.x - l.x * r.z;
        this.z = l.x * r.y - l.y * r.x;

        return this;
    }

    public copy(v: Vector3): Vector3 {

        this.x = v.x;
        this.y = v.y;
        this.z = v.z;

        return this;

    }

    public clone(): Vector3 {

        return new Vector3(this.x, this.y, this.z);

    }

    public lengthSq(): number {

        return this.x * this.x + this.y * this.y + this.z * this.z;

    }

    public length(): number {

        return Math.sqrt(this.lengthSq());

    }

    public normalize(): Vector3 {


        return this.multiplyScalar(1 / this.length());

    }

    public dot(v: Vector3): number {

        return this.x * v.x + this.y * v.y + this.z * v.z;

    }

}