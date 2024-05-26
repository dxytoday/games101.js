export class Matrix4 {

    public constructor(

        public readonly elements = [

            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,

        ]

    ) { }

    public set(

        n11: number, n12: number, n13: number, n14: number,
        n21: number, n22: number, n23: number, n24: number,
        n31: number, n32: number, n33: number, n34: number,
        n41: number, n42: number, n43: number, n44: number,

    ): Matrix4 {

        this.elements[0] = n11;
        this.elements[1] = n12;
        this.elements[2] = n13;
        this.elements[3] = n14;

        this.elements[4] = n21;
        this.elements[5] = n22;
        this.elements[6] = n23;
        this.elements[7] = n24;

        this.elements[8] = n31;
        this.elements[9] = n32;
        this.elements[10] = n33;
        this.elements[11] = n34;

        this.elements[12] = n41;
        this.elements[13] = n42;
        this.elements[14] = n43;
        this.elements[15] = n44;

        return this;

    }

    public multiplyMatrices(left: Matrix4, right: Matrix4): Matrix4 {

        const [

            l11, l12, l13, l14,
            l21, l22, l23, l24,
            l31, l32, l33, l34,
            l41, l42, l43, l44,

        ] = left.elements;

        const [

            r11, r12, r13, r14,
            r21, r22, r23, r24,
            r31, r32, r33, r34,
            r41, r42, r43, r44,

        ] = right.elements;

        this.set(

            l11 * r11 + l12 * r21 + l13 * r31 + l14 * r41, // n11
            l11 * r12 + l12 * r22 + l13 * r32 + l14 * r42, // n12
            l11 * r13 + l12 * r23 + l13 * r33 + l14 * r43, // n13
            l11 * r14 + l12 * r24 + l13 * r34 + l14 * r44, // n14

            l21 * r11 + l22 * r21 + l23 * r31 + l24 * r41, // n21
            l21 * r12 + l22 * r22 + l23 * r32 + l24 * r42, // n22
            l21 * r13 + l22 * r23 + l23 * r33 + l24 * r43, // n23
            l21 * r14 + l22 * r24 + l23 * r34 + l24 * r44, // n24

            l31 * r11 + l32 * r21 + l33 * r31 + l34 * r41, // n31
            l31 * r12 + l32 * r22 + l33 * r32 + l34 * r42, // n32
            l31 * r13 + l32 * r23 + l33 * r33 + l34 * r43, // n33
            l31 * r14 + l32 * r24 + l33 * r34 + l34 * r44, // n34

            l41 * r11 + l42 * r21 + l43 * r31 + l44 * r41, // n41
            l41 * r12 + l42 * r22 + l43 * r32 + l44 * r42, // n42
            l41 * r13 + l42 * r23 + l43 * r33 + l44 * r43, // n43
            l41 * r14 + l42 * r24 + l43 * r34 + l44 * r44, // n44

        )

        return this;

    }

    public invert(): Matrix4 {

        /**
         *
         *      经典伴随矩阵求逆
         *
         *      先计算所有元素的余子式值
         *      然后余子式值组成的矩阵再转置
         *      再除以矩阵的行列式的值
         *
         *      注意：以扩展形式的矩阵行列式求值
         *
         */

        const te = this.elements;

        const n11 = te[0], n12 = te[1], n13 = te[2], n14 = te[3];
        const n21 = te[4], n22 = te[5], n23 = te[6], n24 = te[7];
        const n31 = te[8], n32 = te[9], n33 = te[10], n34 = te[11];
        const n41 = te[12], n42 = te[13], n43 = te[14], n44 = te[15];

        const t11 = n32 * n43 * n24 - n42 * n33 * n24 + n42 * n23 * n34 - n22 * n43 * n34 - n32 * n23 * n44 + n22 * n33 * n44;
        const t12 = n41 * n33 * n24 - n31 * n43 * n24 - n41 * n23 * n34 + n21 * n43 * n34 + n31 * n23 * n44 - n21 * n33 * n44;
        const t13 = n31 * n42 * n24 - n41 * n32 * n24 + n41 * n22 * n34 - n21 * n42 * n34 - n31 * n22 * n44 + n21 * n32 * n44;
        const t14 = n41 * n32 * n23 - n31 * n42 * n23 - n41 * n22 * n33 + n21 * n42 * n33 + n31 * n22 * n43 - n21 * n32 * n43;

        const det = n11 * t11 + n12 * t12 + n13 * t13 + n14 * t14;

        if (det === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

        const detInv = 1 / det;

        te[0] = t11 * detInv;
        te[1] = (n42 * n33 * n14 - n32 * n43 * n14 - n42 * n13 * n34 + n12 * n43 * n34 + n32 * n13 * n44 - n12 * n33 * n44) * detInv;
        te[2] = (n22 * n43 * n14 - n42 * n23 * n14 + n42 * n13 * n24 - n12 * n43 * n24 - n22 * n13 * n44 + n12 * n23 * n44) * detInv;
        te[3] = (n32 * n23 * n14 - n22 * n33 * n14 - n32 * n13 * n24 + n12 * n33 * n24 + n22 * n13 * n34 - n12 * n23 * n34) * detInv;

        te[4] = t12 * detInv;
        te[5] = (n31 * n43 * n14 - n41 * n33 * n14 + n41 * n13 * n34 - n11 * n43 * n34 - n31 * n13 * n44 + n11 * n33 * n44) * detInv;
        te[6] = (n41 * n23 * n14 - n21 * n43 * n14 - n41 * n13 * n24 + n11 * n43 * n24 + n21 * n13 * n44 - n11 * n23 * n44) * detInv;
        te[7] = (n21 * n33 * n14 - n31 * n23 * n14 + n31 * n13 * n24 - n11 * n33 * n24 - n21 * n13 * n34 + n11 * n23 * n34) * detInv;

        te[8] = t13 * detInv;
        te[9] = (n41 * n32 * n14 - n31 * n42 * n14 - n41 * n12 * n34 + n11 * n42 * n34 + n31 * n12 * n44 - n11 * n32 * n44) * detInv;
        te[10] = (n21 * n42 * n14 - n41 * n22 * n14 + n41 * n12 * n24 - n11 * n42 * n24 - n21 * n12 * n44 + n11 * n22 * n44) * detInv;
        te[11] = (n31 * n22 * n14 - n21 * n32 * n14 - n31 * n12 * n24 + n11 * n32 * n24 + n21 * n12 * n34 - n11 * n22 * n34) * detInv;

        te[12] = t14 * detInv;
        te[13] = (n31 * n42 * n13 - n41 * n32 * n13 + n41 * n12 * n33 - n11 * n42 * n33 - n31 * n12 * n43 + n11 * n32 * n43) * detInv;
        te[14] = (n41 * n22 * n13 - n21 * n42 * n13 - n41 * n12 * n23 + n11 * n42 * n23 + n21 * n12 * n43 - n11 * n22 * n43) * detInv;
        te[15] = (n21 * n32 * n13 - n31 * n22 * n13 + n31 * n12 * n23 - n11 * n32 * n23 - n21 * n12 * n33 + n11 * n22 * n33) * detInv;

        return this;

    }

    public transpose(): Matrix4 {

        /**
         *      0   1   2   3         0   4  8   12
         *      4   5   6   7    ->   1   5  9   13
         *      8   9   10  11        2   6  10  14
         *      12  13  14  15        3   7  11  15
         */

        return this.set(

            this.elements[0], this.elements[4], this.elements[8], this.elements[12],
            this.elements[1], this.elements[5], this.elements[9], this.elements[13],
            this.elements[2], this.elements[6], this.elements[10], this.elements[14],
            this.elements[3], this.elements[7], this.elements[11], this.elements[15],

        );

    }

    public clone(): Matrix4 {

        return new Matrix4().copy(this);

    }

    public copy(m: Matrix4): Matrix4 {

        this.elements.length = 0;
        this.elements.push(...m.elements);

        return this;

    }

}