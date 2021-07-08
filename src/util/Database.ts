import sqlite3 from "sqlite3";
import { Configuration } from "./Configuration";

export class Database {

    private static db: sqlite3.Database;

    public static connect(): boolean {
        const hadConnection = typeof Database.db !== "undefined";

        if (hadConnection) Database.db.close();
        Database.db = new (sqlite3.verbose()).Database(`./data/` + Configuration.dbFileName, (err) => {
            if (err) console.log("error", err);
            else console.log("connected");
        });

        return hadConnection
    }

    private static async all(sql: string, params?: any[]): Promise<any> {
        // console.time("request");
        return new Promise((resolve) => {
            if (params) this.db.all(sql, params, (error, response) => {
                if (error) console.log(error);
                // console.timeEnd("request");
                resolve(response);
            });
            else this.db.all(sql, (error, response) => {
                if (error) console.log(error);
                // console.timeEnd("request");
                resolve(response);
            })
        });
    }

    private static async get(sql: string): Promise<any> {
        return new Promise((resolve) => {
            this.db.get(sql, (error, response) => {
                if (error) console.log(error);
                resolve(response);
            })
        });
    }

    public static async lookupTag(names: string[]): Promise<TagData[]> {
        return this.all(`SELECT "name", "category", "count" FROM "tags" WHERE [name] IN (${Database.generateWhere(names.length)});`, names);
    }

    public static async getAllTags(showEmptyTags = false): Promise<TagData[]> {
        return this.all(`SELECT "name", "category", "count" FROM "tags" ${showEmptyTags ? "" : `WHERE "count" > 0`};`);
    }

    public static async findTagRegex(regex: RegExp, showEmptyTags = false): Promise<TagData[]> {
        return this.all(`SELECT * FROM "tags" WHERE "name" REGEXP ? ${showEmptyTags ? "" : ` AND "count" > 0`};`, [regex.toString().replace(/^\/|\/$/g, '')]);
    }

    public static async indexTags(): Promise<string[]> {
        const lookup = await this.all(`SELECT "name" FROM "tags";`);
        const output = new Array(lookup.length);
        for (let i = 0; i < lookup.length; i++)
            output[i] = lookup[i].name;
        return output;
    }

    public static async lookupAlias(name: string, type: "source" | "target"): Promise<AliasData[]> {
        return this.all(`SELECT "source", "target" FROM "aliases" WHERE ${type} = ?;`, [name]);
    }

    public static async lookupAliasSet(names: string[], type: "source" | "target"): Promise<AliasData[]> {
        return this.all(`SELECT  "source", "target" FROM "aliases" WHERE [${type}] IN (${Database.generateWhere(names.length)});`, names);
    }

    public static async lookupImplication(name: string, type: "source" | "target"): Promise<AliasData[]> {
        return this.all(`SELECT "source", "target" FROM "implications" WHERE ${type} = ?;`, [name]);
    }

    public static async lookupImplicationSet(names: string[], type: "source" | "target"): Promise<AliasData[]> {
        return this.all(`SELECT  "source", "target" FROM "implications" WHERE [${type}] IN (${Database.generateWhere(names.length)});`, names);
    }

    public static async countTags(): Promise<number> {
        return this.get(`SELECT max(RowId) FROM "tags"`).then((response) => response["max(RowId)"]);
    }

    public static async countAliases(): Promise<number> {
        return this.get(`SELECT max(RowId) FROM "aliases"`).then((response) => response["max(RowId)"]);
    }

    public static async countImplications(): Promise<number> {
        return this.get(`SELECT max(RowId) FROM "implications"`).then((response) => response["max(RowId)"]);
    }


    private static generateWhere(length: number): string {
        const where = [];
        for (let i = 0; i < length; i++)
            where.push(`?`);
        return where.join(", ");
    }

}

export interface TagData {
    name: string;
    category: number;
    count: number;
}

export interface AliasData {
    source: string;
    target: string;
}
