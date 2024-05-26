
export class Texture {

    private imageData: ImageData | undefined;

    public width = 0;
    public height = 0;

    public constructor(img: HTMLImageElement) {

        const canvas = document.createElement('canvas');

        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

        ctx.drawImage(img, 0, 0, img.width, img.height);

        this.imageData = ctx.getImageData(0, 0, img.width, img.height);

        this.width = img.width;
        this.height = img.height;

    }

    public static load(name: string): Promise<Texture> {

        return new Promise((resolve, _reject) => {

            const img = document.createElement('img');

            img.onload = () => {

                resolve(new Texture(img));

            }

            img.src = name;

        });

    }

}
