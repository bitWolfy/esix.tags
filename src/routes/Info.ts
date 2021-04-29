import { StoredData } from "../util/StoredData";
import { VersionChecker } from "../util/VersionChecker";
import { PageRoute } from "./_PageRoute";


export class InfoRoute extends PageRoute {

    public constructor(app, rateLimiter) {
        super(app, rateLimiter);

        app.get('/info', (req, res) => {

            res.json({
                "tags": StoredData.countTags(),
                "aliases": StoredData.countAliases(),
                "implications": StoredData.countImplications(),
                "last": VersionChecker.lastUpdate,
                "next": VersionChecker.nextUpdate,
            });

        });

    }

}
