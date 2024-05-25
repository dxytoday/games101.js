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

}