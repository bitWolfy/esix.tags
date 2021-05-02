import { Configuration } from "../../util/Configuration";
import { TagData } from "../../util/Database";
import { StoredData } from "../../util/DatabaseLookup";
import { TagValidator } from "../../util/TagValidator";
import { PageRoute } from "../_PageRoute";

export class FindRoute extends PageRoute {

    public constructor(app, rateLimiter) {
        super(app, rateLimiter);

        app.get('/tags/find.json', rateLimiter, async (req, res) => {
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

            // console.time("esix.find");
            const lookup = new Set<TagData>();
            let count = 0;
            const tagsList = (req.query.mode == "pattern" && Configuration.dbRegExpEnabled)
                ? await StoredData.findTags(regex, showEmptyTags)
                : await StoredData.getTagList(showEmptyTags);
            for (let index = 0; index < tagsList.length; index++) {
                if (count >= 25000) break;

                const tag = tagsList[index];
                if (isResult(tag.name) != invertResults) {

                    // Skip empty tags
                    if (!showEmptyTags && tag.count <= 0) continue;

                    // Skip if category does not match
                    if (categoryMatchEnabled && categoryMatch !== tag.category) continue;

                    lookup.add(tag);
                    count++;
                }
            }

            const output = await StoredData.runData(Array.from(lookup), includeRelations);
            // console.timeEnd("esix.find");
            res.json(output);
        });
    }

}
