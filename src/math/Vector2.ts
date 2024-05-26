export class Vector2 {

    public constructor(

        public x = 0,
        public y = 0,

    ) { }

    public add(v: Vector2): Vector2 {

        this.x += v.x;
        this.y += v.y;

        return this;

    }

    public copy(v: Vector2): Vector2 {

        this.x = v.x;
        this.y = v.y;

        return this;

    }

    public multiplyScalar(scalar: number): Vector2 {

        this.x *= scalar;
        this.y *= scalar;

        return this;

    }

}