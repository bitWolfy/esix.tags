import { StoredData } from "../util/StoredData";
import { PageRoute } from "./_PageRoute";

export class ListRoute extends PageRoute {

    public constructor(app, rateLimiter) {
        super(app, rateLimiter);

        app.get('/list', rateLimiter, (req, res) => {
            // console.log(req.query.name);
            if (!req.query.name) {
                res.json({});
                return;
            }

            const output = StoredData.lookup(req.query.name.split(","));
            res.json(output);
        });

    }

}
