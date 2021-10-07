import { StoredData } from "../../util/DatabaseLookup";
import { PageRoute } from "../_PageRoute";

export class CountRoute extends PageRoute {

    public constructor(app, rateLimiter) {
        super(app, rateLimiter);

        app.get('/tags/count.json', rateLimiter, async (req, res) => {
            // console.log(req.query.name);
            if (!req.query.name) {
                res.json({});
                return;
            }

            const output = await StoredData.count(req.query.name.split(","));
            res.json(output);
        });

    }

}
