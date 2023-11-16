import http, { IncomingMessage, OutgoingHttpHeaders, Server, ServerResponse } from "http";
import https from "https";
import net from "net";
import ejs from "ejs";
import fs from "fs";
import app from "./app";
import EJSArguments from "./arguments";
import mimetypes from "mime-types";
import Collections from "../utils/collections";
import busboy from "busboy";

type condition = boolean | 0 | 1;

class HttpServer {
    static readonly main: HttpServer = new HttpServer();
    server: Server;
    instancename: string;
    readonly hosts: string[] = [process.env.HOST || "www", "localhost", "127.0.0.1", "::1"];
    readonly ports: (string | number)[] = [process.env.PORT || 1337];
    
    defaults: OutgoingHttpHeaders = {
        "Content-Type": "application/octet-stream"
    };

    constructor() {
        this.start();
        this.log("HTTP server started");
    }

    start() {
        this.instancename = this.today();

        this.log("Starting Server as " + this.instancename, 1);
        // this.server = http.createServer(this.GET.bind(this)).listen(this.ports[0]);

        app.listen(this.ports[0]);
        app.get("/", this.GET);
        app.post("/", this.POST);
        
        this.logHosts();
        this.log("Using default headers:", [this.defaults], 1);
        this.log("Server Started", 1);

        this.log(`./data/requests/${this.instancename}.log`);

    }
    process(req: IncomingMessage, res: ServerResponse): void {
        this.log("Recieved request", 1);
        const path: string = this.getPath(this.checkOverride(req.url));

        this.log("Locating " + path);
        fs.stat(path, (err, stats) => {
            if (err) {
                this.NOT_FOUND(path, req, res);
            } else {
                if (stats.isDirectory()) this.found(path + "/index.ejs", req, res);
                this.found(path, req, res);
            }
        });
    }
    GET(req: IncomingMessage, res: ServerResponse): void {
        this.process(req, res);
    }
    POST(req: IncomingMessage, res: ServerResponse): void {
        const bb = busboy({ headers: req.headers });
        bb.on("file", (name, file, info) => {
            const { filename, encoding, mimeType } = info;
            console.log(
                `File [${name}]: filename: %j, encoding: %j, mimeType: %j`,
                filename,
                encoding,
                mimeType
            );
            file.on("data", (data) => {
                console.log(`File [${name}] got ${data.length} bytes`);
            }).on("close", () => {
                console.log(`File [${name}] done`);
            });
        });
        bb.on("field", (name, val, info) => {
            console.log(`Field [${name}]: value: %j`, val);
        });
        bb.on("close", () => {
            console.log("Done parsing form!");
            res.writeHead(303, { Connection: "close", Location: "/" });
            res.end();
        });
        req.pipe(bb);
    }

    log(message: string, extra?: any[] | condition, toFile?: condition): void {
        const msg: string
         = "[" + this.rightNow() + "] "
         + message + (extra instanceof Array ? " " + extra.join(" ") : "");
        console.log(msg);
        if (toFile || extra == true || extra == 1) this.logToFile(msg);
    }
    logToFile(...message: any[]): void {
        fs.appendFile(
            `./data/requests/${this.instancename}.log`,
            message.join(" ") + "\n",
            (err) => err && console.error(err));
    }
    logRequest(req: IncomingMessage, res: ServerResponse): void {
        const reqHeaders = Collections.stringify(req.headers, ["\n> ", " = "], [""]);
        const resHeaders = Collections.stringify(res.getHeaders(), ["\n> ", " = "], [""]);
        this.logToFile(
            "-----at", this.rightNow() +
            "\n**REQUEST**\nRequested:", req.method, req.url, "HTTP/" + req.httpVersion,
            "\nSocket (Remote):", req.socket.remoteAddress, req.socket.remotePort,
            "\nSocket (Local):", req.socket.localAddress, req.socket.localPort,
            "\nHEADERS", reqHeaders +
            "\nBODY:", req.read() +
            "\n\n**RESPONSE**\nStatus:", "HTTP/" + req.httpVersion, res.statusCode, res.statusMessage,
            "\nUpgrading:", res.upgrading ,
            "\nKeepalive:", res.shouldKeepAlive,
            "\nSocket (Remote):", this.formatIP(res.socket?.remoteAddress) + ":" + res.socket?.remotePort,
            "\nSocket (Local):", this.formatIP(res.socket?.localAddress) + ":" + res.socket?.localPort,
            "\nUseChunkedEncodingDyDefault:", res.useChunkedEncodingByDefault,
            "\nChunked Encoding:", res.chunkedEncoding,
            "\nSend Date:s", res.sendDate,
            "\nHEADERS" + resHeaders + 
            "")

            
        console.log(new Map(Object.entries(req.headers)));

    }
    readbody(r: IncomingMessage | ServerResponse): string {
        const content: any = app;
        content;
        return "";
    }
    
    logHosts() {
        Collections.combineLists(this.hosts, this.ports, (h, p) => {
            return this.formatIP(h) + ":" + p;
        }).forEach((i) => {
            this.log("Listening to", [i], 1);
        });
    }
    formatIP(ip: string) {
        if (ip?.includes(":")) ip = `[${ip}]`;
        return ip;
    }

    greet(): void {
        this.log("Hello!", 1);
    }
    close() {
        this.log("Stopping Server", 1);
        this.server.close();
        this.log("Server Stopped", 1);
    }
    restart() {
        this.close();
        this.start();
    }

    today(): string {
        return new Date().toISOString().replace(/T.*/, "");
    }
    rightNow(): string {
        return new Date().toISOString().replace("T", " ").replace("Z", "");
    }
    checkOverride(url: string): string {
        if (url == "/favicon.ico") return "/assets/icons/favicon.ico";
        return url;
    }
    getPath(url: string, ext: string = "main/www"): string {
        return "docs/" + ext + url;
    }
    found(content: string, req: IncomingMessage, res: ServerResponse): void {
        this.log("Found file or directory " + req.url);
        this.OK(content, req, res);
    }
    use(code: number, path: string, req: IncomingMessage, res: ServerResponse): void {
        this.log("Rendering " + path);
        const headers: OutgoingHttpHeaders = {};
        let content: string = "";
        fs.readFile(path, (err, data) => {
            if (err) {
                this.NOT_FOUND(path, req, res);
                return;
            } else if (path.endsWith(".ejs")) {
                headers["Content-Type"] = "text/html";
                content = ejs.render(data.toString(), new EJSArguments(req.url));
            } else {
                headers["Content-Type"] = mimetypes.contentType(path) || this.defaults["Content-Type"];
                content = data.toString();
            };
            res.writeHead(code, headers);
            res.write(content);
            res.end();
            this.logRequest(req, res);
            this.log("* Sent response", 1);
        });
    }
    error(code: number, msg: string, req: IncomingMessage, res: ServerResponse): void {
        console.log(msg);
        this.use(code, this.getPath("/" + code + ".ejs", "error"), req, res);
    }

    OK(path: string, req: IncomingMessage, res: ServerResponse): void {
        console.log("OK: " + req.url);
        this.use(200, path, req, res);
    }

    NOT_FOUND(path: string, req: IncomingMessage, res: ServerResponse): void {
        this.error(404, "NOT FOUND: " + path, req, res);
    }
}

export default HttpServer.main;