import { StoredData } from "../util/StoredData";
import { TagValidator } from "../util/TagValidator";
import { PageRoute } from "./_PageRoute";

export class FindRoute extends PageRoute {

    public constructor(app, rateLimiter) {
        super(app, rateLimiter);

        app.get('/find', rateLimiter, (req, res) => {
            // console.log(req.query.name);
            if (!req.query.mode) {
                res.json({});
                return;
            }

            const showEmptyTags = req.query.empty == "true";
            const invertResults = req.query.invert == "true";
            const includeRelations = req.query.relations == "true";

            let regex: RegExp;
            try { regex = req.query.pattern ? new RegExp(req.query.pattern) : null; }
            catch (e) {
                res.json({});
                return;
            }

            let categoryMatch = req.query.category ? parseInt(req.query.category) : null;
            if (Number.isNaN(categoryMatch)) categoryMatch = null;
            const categoryMatchEnabled = categoryMatch !== null;

            let isResult: (tag: string) => boolean;
            switch (req.query.mode) {
                case "unicode":
                    isResult = TagValidator.hasUnicode;
                    break;
                case "invalid":
                    isResult = TagValidator.hasInvalidCharacters;
                    break;
                case "japanese":
                    isResult = TagValidator.hasJapanese;
                    break;
                case "uppercase":
                    isResult = TagValidator.hasUppercase;
                    break;
                case "pattern":
                    if (regex == null) {
                        res.json({});
                        return;
                    }
                    isResult = (tag): boolean => { return regex.test(tag); }
                    break;
                default:
                    res.json({});
                    return;
            }

            // console.time("esix.perf");
            const lookup = new Set<string>();
            let count = 0;
            const tags = StoredData.indexTags();
            const info = StoredData.getTags();
            const tagCount = tags.length;
            for (let index = 0; index < tagCount; index++) {
                if (count >= 25000) break;

                const tag = tags[index];
                if (isResult(tag) != invertResults) {
                    const data = info[tag];

                    // Skip empty tags
                    if (!showEmptyTags && data["count"] <= 0) continue;

                    // Skip if category does not match
                    if (categoryMatchEnabled && categoryMatch !== data["category"]) continue;

                    lookup.add(tag);
                    count++;
                }
            }
            // console.timeEnd("esix.perf");

            const output = StoredData.lookup(Array.from(lookup), includeRelations);
            res.json(output);
        });
    }

}
