import { Database, TagData } from "./Database";

export class StoredData {

    /**
     * Searches for provided tags and returns their data, aliases, and implications
     * @param lookup Tags to look up
     * @param includeRelations If true, will also include data on direct relations in the output
     * @returns Tag data
     */
    public static async run(lookup: string | string[], includeRelations = false): Promise<DataOutputSet> {

        // Desperate attempt to prevent this from fucking up the DB search
        if (!lookup) return {};
        if (!Array.isArray(lookup)) lookup = [lookup];
        if (lookup.length == 0) return {};

        // First search - looks up the data on the specified tags
        const rawData = await Database.lookupTag(lookup);
        return this.runData(rawData, includeRelations);
    }

    /**
     * Same as run(), but takes in the TagData as input.  
     * Useful for when the original tag data has already been fetched through other means.
     * @param rawData Tag data to format
     * @param includeRelations If true, will also include data on direct relations in the output
     * @returns Tag data
     */
    public static async runData(rawData: TagData[], includeRelations = false): Promise<DataOutputSet> {
        if (rawData.length == 0) return {};

        let firstLookup = {};
        for (const tag of Object.values(rawData)) {
            firstLookup[tag.name] = {
                category: tag.category,
                count: tag.count,
            };
        }

        let resolvedAliases = await this.resolveAliases(firstLookup, includeRelations);
        firstLookup = resolvedAliases[0];


        // Either the relationships are not to be included,
        // or there weren't any that needed to be looked up.
        if (resolvedAliases[1].length == 0) return firstLookup;

        // Second search - simplified version
        // Might have to recurse this, if I ever need to get a full relationship tree
        let secondLookup = {}
        rawData = await Database.lookupTag(resolvedAliases[1]);
        for (const tag of Object.values(rawData)) {
            secondLookup[tag.name] = {
                category: tag.category,
                count: tag.count,
            };
        }

        resolvedAliases = await this.resolveAliases(secondLookup);
        secondLookup = resolvedAliases[0];

        return { ...firstLookup, ...secondLookup };
    }

    /**
     * Searches for aliases and implications for the specified tag set in the database
     * @param tagData TagData, in the format returned by the run() function
     * @param includeRelations If true, will also return a list of tags to look up in the second iteration
     * @returns Tag data and list of related tags
     */
    private static async resolveAliases(tagData: DataOutputSet, includeRelations = false): Promise<[DataOutputSet, string[]]> {
        const tags = Object.keys(tagData);

        const relationsLookup = [];

        const aliasedToLookup = await Database.lookupAliasSet(tags, "source");
        // console.log(aliasedToLookup.length, "aliasedToLookup");
        for (const alias of aliasedToLookup) {
            tagData[alias.source] = pushEntry(tagData[alias.source], "aliasedTo", alias.target);
            if (includeRelations) relationsLookup.push(alias.target);
        }

        const aliasedByLookup = await Database.lookupAliasSet(tags, "target");
        // console.log(aliasedByLookup.length, "aliasedByLookup");
        for (const alias of aliasedByLookup)
            tagData[alias.target] = pushEntry(tagData[alias.target], "aliasedBy", alias.source);

        const impliesLookup = await Database.lookupImplicationSet(tags, "source");
        // console.log(impliesLookup.length, "impliesLookup");
        for (const implication of impliesLookup) {
            tagData[implication.source] = pushEntry(tagData[implication.source], "implies", implication.target);
            if (includeRelations) relationsLookup.push(implication.target);
        }

        const impliedByLookup = await Database.lookupImplicationSet(tags, "target");
        // console.log(impliedByLookup.length, "impliedByLookup");
        for (const implication of impliedByLookup)
            tagData[implication.target] = pushEntry(tagData[implication.target], "impliedBy", implication.source);

        return [tagData, relationsLookup];

        function pushEntry(tag: DataOutput, key: "aliasedTo" | "aliasedBy" | "implies" | "impliedBy", value: string): DataOutput {
            const result = tag[key] || [];
            result.push(value);
            tag[key] = result;
            return tag;
        }
    }

    public static async getTagList(showEmptyTags = false): Promise<TagData[]> {
        return Database.getAllTags(showEmptyTags);
    }

    public static async findTags(regex: RegExp, showEmptyTags = false): Promise<TagData[]> {
        return Database.findTagRegex(regex, showEmptyTags);
    }

}

interface DataOutputSet {
    [tag: string]: DataOutput;
}

interface DataOutput {
    category: number;
    count: number;
    aliasedTo?: string[];
    aliasedBy?: string[];
    implies?: string[];
    impliedBy?: string[];
}
