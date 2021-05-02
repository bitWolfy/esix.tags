import { Database } from "../../util/Database";
import { VersionChecker } from "../../util/VersionChecker";
import { PageRoute } from "../_PageRoute";


export class InfoRoute extends PageRoute {

    public constructor(app, rateLimiter) {
        super(app, rateLimiter);

        app.get('/tags/info.json', async (req, res) => {

            res.json({
                "tags": await Database.countTags(),
                "aliases": await Database.countAliases(),
                "implications": await Database.countImplications(),
                "last": VersionChecker.lastUpdate,
                "next": VersionChecker.nextUpdate,
            });

        });

    }

}
