import { Texture } from "./Texture";
import { Vector2 } from "./math/Vector2";
import { Vector3 } from "./math/Vector3";

export class fragment_shader_payload {

    public view_pos: Vector3 | undefined;

    public constructor(

        public color: Vector3 | undefined,
        public normal: Vector3 | undefined,
        public tex_coords: Vector2 | undefined,
        public texture: Texture | undefined,

    ) { }

}

export class vertex_shader_payload {

    public position: Vector3 | undefined;

};