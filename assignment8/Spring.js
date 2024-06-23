
/** 弹簧 */
class Spring {

	/** 质点 a */
	ma;

	/** 质点 b */
	mb;

	/** 弹性系数 */
	ks = 0;

	/** 静止长度 */
	restLen = 0;


	constructor(ma, mb, ks) {

		this.ma = ma;
		this.mb = mb;

		this.ks = ks;

		this.restLen = ma.position.distanceTo(mb.position);

	}

}

export { Spring };