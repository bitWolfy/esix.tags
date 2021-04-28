import { PageRoute } from "./_PageRoute";

export class DefaultRoute extends PageRoute {

    public constructor(app, rateLimiter) {
        super(app, rateLimiter);

        app.get("/", (req, res) => {
            res.send("Nothing here");
        });
    }

}
