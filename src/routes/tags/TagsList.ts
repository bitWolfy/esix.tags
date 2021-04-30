import { StoredData } from "../../util/StoredData";
import { PageRoute } from "../_PageRoute";

export class ListRoute extends PageRoute {

    public constructor(app, rateLimiter) {
        super(app, rateLimiter);

        app.get('/tags/list.json', rateLimiter, (req, res) => {
            // console.log(req.query.name);
            if (!req.query.name) {
                res.json({});
                return;
            }

            const includeRelations = req.query.relations == "true";

            const output = StoredData.lookup(req.query.name.split(","), includeRelations);
            res.json(output);
        });

    }

}
