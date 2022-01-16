export class Icko {
    // Create new instances of the same class as static attributes
    constructor(male, kratke, makke, obojake = false) {
        if (typeof male != "boolean"
            || typeof kratke != "boolean"
            || typeof makke != "boolean") {
            throw ('Parameters must be boolean')
        }
        this.male = male
        this.kratke = kratke
        this.makke = makke
        this.obojake = obojake
    }
}

export default Icko