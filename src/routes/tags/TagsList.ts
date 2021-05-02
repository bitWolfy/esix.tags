import { StoredData } from "../../util/DatabaseLookup";
import { PageRoute } from "../_PageRoute";

export class ListRoute extends PageRoute {

    public constructor(app, rateLimiter) {
        super(app, rateLimiter);

        app.get('/tags/list.json', rateLimiter, async (req, res) => {
            // console.log(req.query.name);
            if (!req.query.name) {
                res.json({});
                return;
            }

            const includeRelations = req.query.relations == "true";

            const output = await StoredData.run(req.query.name.split(","), includeRelations);
            res.json(output);
        });

    }

}
