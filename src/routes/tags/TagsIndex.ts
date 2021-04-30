import { PageRoute } from "../_PageRoute";

export class TagsIndex extends PageRoute {

    public constructor(app, rateLimiter) {
        super(app, rateLimiter);

        app.get("/tags", (req, res) => {
            res.sendFile("index.html", { "root": __dirname + "/../../pages/" });
        });
    }

}
