import csv from "csv-parser";
import fs from "fs";

export class StoredData {

    public static tags: DataStorage = {};
    public static aliases: DataStorage = {};
    public static implications: DataStorage = {};

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
            }).then((count) => {
                StoredData.tags = results;
                return count;
            });
    }

    public static async importAliases(): Promise<number> {
        const results = {};
        return StoredData.importData(
            "aliases",
            ["id", "antecedent", "consequent", "created", "status"],
            (row) => {
                if (row.status !== "active") return;
                results[row.antecedent] = row.consequent;
            }).then((count) => {
                StoredData.aliases = results;
                return count;
            });
    }

    public static async importImplications(): Promise<number> {
        const results = {};
        return StoredData.importData(
            "implications",
            ["id", "antecedent", "consequent", "created", "status"],
            (row) => {
                if (row.status !== "active") return;
                const data = results[row.antecedent] || [];
                data.push(row.consequent);
                results[row.antecedent] = data;
            }).then((count) => {
                StoredData.implications = results;
                return count;
            });
    }

    private static async importData(type: string, headers: string[], append: (row: any) => void): Promise<number> {
        return new Promise((resolve) => {
            let count = 0;
            fs.createReadStream(`./data/${type}.csv`)
                .pipe(csv({
                    skipLines: 1,
                    headers: headers,
                }))
                .on("data", (row) => {
                    append(row);
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
