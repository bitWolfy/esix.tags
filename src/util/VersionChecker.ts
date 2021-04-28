import fs from "fs";

export class VersionChecker {

    public static lastUpdate: Date;
    public static nextUpdate: Date;

    public static update(): void {
        const data = fs.readFileSync("./data/version.txt", "utf8").replace(/\r?\n|\r/g, "");

        const now = new Date();
        VersionChecker.lastUpdate = new Date(data);
        VersionChecker.nextUpdate = new Date(now.getFullYear() + "-" + now.getMonth() + "-" + now.getDate() + " 15:00 GMT");
        VersionChecker.nextUpdate.setDate(VersionChecker.nextUpdate.getDate() + 1);
    }

}
