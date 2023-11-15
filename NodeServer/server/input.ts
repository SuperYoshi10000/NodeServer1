const getInput = require("prompt-sync")();
import server from "./server";
import http from "http";

class UserInput {
    static start(): void {
        while(true) {
            UserInput.showPrompt();
        }
    }
    static showPrompt(): string {
        const input: string = getInput("> ");
        UserInput.processInput(input);
        return input;
    }
    static processInput(input: string) {
        if (input.startsWith(".")) {
            switch(input){
                case ".exit":
                case ".quit":
                case ".stop":
                case ".end":
                case ".kill":
                case ".close":
                case ".shutdown":
                    server.close();
                    process.exit();
                case ".reload":
                case ".restart":
                case ".reboot":
                case ".reset":
                    server.restart();
                    break;
                case ".status":
                case ".info":
                    console.log(server);
                    break;
                case ".clear":
                case ".cls":
                    console.clear();
                    break;
                case ".help":
                    console.log("Commands:");
                    console.log(".exit - Exit the server");
                    console.log(".restart - Restart the server");
                    console.log(".status - Get server status");
                    console.log(".clear - Clear the console");
                    console.log(".help - Show this message");
                    break;
                case ".ping":
                    console.log("Pong!");
                    break;
                case ".hello":
                case ".hi":
                case ".greet":
                case ".welcome":
                case ".salute":
                    server.greet();
                    break;
                case "...":
                    console.log("...");
                    break;
                default:
                    console.log("Invalid command '" + input + "'");
                    break;
            }
        } else {
            try {
                var result: any = eval(input);
                if (typeof result == "string") {
                    result = "\"" + result
                        .replace(/\\/g, "\\\\")
                        .replace(/\"/g, "\\\"")
                        .replace(/\n/g, "\\n")
                        .replace(/\r/g, "\\r")
                        .replace(/\t/g, "\\t")
                        .replace(/\f/g, "\\f")
                        .replace(/\v/g, "\\v")
                        .replace(/\0/g, "\\0")
                        + "\"";
                }
                console.log(result);
            } catch (e) {
                console.error(e);
            }
        }
    }

}

export default UserInput;