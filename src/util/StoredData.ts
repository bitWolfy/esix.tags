import csv from "csv-parser";
import fs from "fs";

export class StoredData {

    private static tags: DataStorage = {};          // stored tag data
    private static tagCount = 0;                    // total number of tags stored
    private static tagIndex = [];                   // keys of `tag` for quicker lookups

    private static aliasedTo: DataStorage = {};     // tag that the key is aliased to
    private static aliasedBy: DataStorage = {};     // tags that are aliased to the key
    private static aliasCount = 0;

    private static implications: DataStorage = {};  // tags that the key implies
    private static implicatedBy: DataStorage = {};  // tags that imply the key
    private static implicationCount = 0;

    public static getTags(): DataStorage { return this.tags; }
    public static countTags(): number { return this.tagCount; }

    public static getAliasedTo(): DataStorage { return this.aliasedTo; }
    public static getAliasedBy(): DataStorage { return this.aliasedBy; }
    public static countAliases(): number { return this.aliasCount; }

    public static getImplications(): DataStorage { return this.implications; }
    public static countImplications(): number { return this.implicationCount; }

    public static indexTags(): string[] { return this.tagIndex; }

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
                this.tagIndex = Object.keys(StoredData.tags);
                return count;
            });
    }

    public static async importAliases(): Promise<number> {
        const aliasedTo = {};
        const aliasesFor = {};
        return StoredData.importData(
            "aliases",
            ["id", "antecedent", "consequent", "created", "status"],
            (row) => {
                if (row.status !== "active") return false;

                aliasedTo[row.antecedent] = row.consequent;

                const data = aliasesFor[row.consequent] || [];
                data.push(row.antecedent);
                aliasesFor[row.consequent] = data;

                return true;
            }).then((count) => {
                StoredData.aliasedTo = aliasedTo;
                StoredData.aliasedBy = aliasesFor;
                this.aliasCount = count;
                return count;
            });
    }

    public static async importImplications(): Promise<number> {
        const implications = {};
        const implicatedBy = {};
        return StoredData.importData(
            "implications",
            ["id", "antecedent", "consequent", "created", "status"],
            (row) => {
                if (row.status !== "active") return false;

                const data1 = implications[row.antecedent] || [];
                data1.push(row.consequent);
                implications[row.antecedent] = data1;

                const data2 = implicatedBy[row.consequent] || [];
                data2.push(row.antecedent);
                implicatedBy[row.consequent] = data2;

                return true;
            }).then((count) => {
                StoredData.implications = implications;
                StoredData.implicatedBy = implicatedBy;
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

        // console.time("esix.lookup");

        const output = {};
        for (const key of lookup) {
            if (!StoredData.tags[key]) continue;
            const result = StoredData.tags[key];

            const aliasedToLookup = StoredData.aliasedTo[key];
            if (aliasedToLookup) {
                result["aliasedTo"] = aliasedToLookup;
                if (includeRelations) lookup.push(aliasedToLookup);
            }

            const aliasedByLookup = StoredData.aliasedBy[key];
            if (aliasedByLookup) {
                result["aliasedBy"] = aliasedByLookup;
            }

            const implicationsLookup = StoredData.implications[key];
            if (implicationsLookup) {
                result["implies"] = implicationsLookup;
                if (includeRelations) {
                    for (const tag of implicationsLookup)
                        lookup.push(tag);
                }
            }

            const implicatedByLookup = StoredData.implicatedBy[key];
            if (implicatedByLookup) {
                result["impliedBy"] = implicatedByLookup;
            }

            output[key] = result;
        }

        // console.timeEnd("esix.lookup");

        return output;
    }

}

interface DataStorage {
    [prop: string]: any;
}
