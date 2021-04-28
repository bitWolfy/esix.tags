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
                    isResult = (tag) => { return regex.test(tag); }
                    break;
                default:
                    res.json({});
                    return;
            }

            const lookup = [];
            let count = 0;
            for (const [tag, data] of Object.entries(StoredData.tags)) {

                if (count >= 25000) break;

                // Skip empty tags if needed
                if (!showEmptyTags && data["count"] <= 0) continue;

                // Validate the tags
                const validatorResponse = isResult(tag);
                if ((validatorResponse && !invertResults) || (!validatorResponse && invertResults)) {
                    if (categoryMatch !== null && categoryMatch !== data["category"]) continue;
                    lookup.push(tag);
                    count++;
                }
            }

            const output = StoredData.lookup(lookup, includeRelations);
            res.json(output);
        });
    }

}
