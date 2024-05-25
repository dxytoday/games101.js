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

    public subVectors(l: Vector3, r: Vector3): Vector3 {

        this.x = l.x - r.x;
        this.y = l.y - r.y;
        this.z = l.z - r.z;

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

}