import csv from "csv-parser";
import fs from "fs";

export class StoredData {

    private static tags: DataStorage = {};
    private static tagCount = 0;
    private static aliases: DataStorage = {};
    private static aliasCount = 0;
    private static implications: DataStorage = {};
    private static implicationCount = 0;

    public static getTags(): DataStorage { return this.tags; }
    public static getAliases(): DataStorage { return this.aliases; }
    public static getImplications(): DataStorage { return this.implications; }
    public static countTags(): number { return this.tagCount; }
    public static countAliases(): number { return this.aliasCount; }
    public static countImplications(): number { return this.implicationCount; }

    public static async importTags(): Promise<number> {
        const results = {};
        return StoredData.importData(
            "tags",
            ["id", "name", "cat", "num"],
            (row) => {
                results[row.name] = {
                    id: parseInt(row.id),
                    category: parseInt(row.cat),
                    count: parseInt(row.num),
                };
                return true;
            }).then((count) => {
                StoredData.tags = results;
                this.tagCount = count;
                return count;
            });
    }

    public static async importAliases(): Promise<number> {
        const results = {};
        return StoredData.importData(
            "aliases",
            ["id", "antecedent", "consequent", "created", "status"],
            (row) => {
                if (row.status !== "active") return false;
                results[row.antecedent] = row.consequent;
                return true;
            }).then((count) => {
                StoredData.aliases = results;
                this.aliasCount = count;
                return count;
            });
    }

    public static async importImplications(): Promise<number> {
        const results = {};
        return StoredData.importData(
            "implications",
            ["id", "antecedent", "consequent", "created", "status"],
            (row) => {
                if (row.status !== "active") return false;
                const data = results[row.antecedent] || [];
                data.push(row.consequent);
                results[row.antecedent] = data;
                return true;
            }).then((count) => {
                StoredData.implications = results;
                this.implicationCount = count;
                return count;
            });
    }

    private static async importData(type: string, headers: string[], append: (row: any) => boolean): Promise<number> {
        return new Promise((resolve) => {
            let count = 0;
            fs.createReadStream(`./data/${type}.csv`)
                .pipe(csv({
                    skipLines: 1,
                    headers: headers,
                }))
                .on("data", (row) => {
                    if (append(row))
                        count++;
                })
                .on("end", () => {
                    console.log(`processed ${count} ${type}`);
                    resolve(count);
                });
        });
    }

    public static lookup(lookup: string | string[], includeRelations = true): any {
        if (!Array.isArray(lookup)) lookup = [lookup];

        const output = {};
        for (const key of lookup) {
            if (!StoredData.tags[key]) continue;
            const result = StoredData.tags[key];

            const aliasLookup = StoredData.aliases[key];
            if (aliasLookup) {
                result["aliasof"] = aliasLookup;
                if (includeRelations) lookup.push(aliasLookup);
            }

            const implicationsLookup = StoredData.implications[key];
            if (implicationsLookup) {
                result["implies"] = implicationsLookup;
                if (includeRelations) {
                    for (const tag of implicationsLookup)
                        lookup.push(tag);
                }
            }

            output[key] = result;
        }

        return output;
    }

}

interface DataStorage {
    [prop: string]: any;
}
