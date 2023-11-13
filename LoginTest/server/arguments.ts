const partials = process.cwd() + "/docs/partials/";

function partial(path: string): string {
    return partials + path + ".ejs";
}

export default class EJSArguments {
    partials = partials;
    part = {
        head: partial("head"),
        header: partial("header"),
        footer: partial("footer"),
        nav: partial("nav"),
    };
    data: object;
    url: string;

    constructor(url: string) {
        this.url = url;
    }
    clone(data: object): EJSArguments {
        const args = new EJSArguments(this.url);
        args.data = data;
        return args;
    }
};