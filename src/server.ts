import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import { Routes } from "./routes/_Routes";
import { StoredData } from "./util/StoredData";
import { VersionChecker } from "./util/VersionChecker";


// Set up the server
const app = express();
app.use(cors());

const rateLimiter = rateLimit({
    windowMs: 1000,
    max: 1,
    handler: (req, res) => {
        res.status(429);
        res.json({});
    },
});

// Register routes
for (const route of Routes)
    new route(app, rateLimiter);


// Launch the server
const server = app.listen(3001, "localhost", () => {
    const address = server.address();
    console.log(`Listening on ${typeof address == "string" ? address : ("port " + address.port)}...`);

    // Start loading the data
    let cacheVersion = 0;
    function reloadData(): void {
        VersionChecker.update();
        if (cacheVersion == VersionChecker.lastUpdate.getTime()) return;
        console.log("Updating cache:", VersionChecker.lastUpdate);
        cacheVersion = VersionChecker.lastUpdate.getTime();

        Promise.all([
            StoredData.importTags(),
            StoredData.importAliases(),
            StoredData.importImplications(),
        ]).then(() => {
            console.log("Cache updated");
        });
    }
    setInterval(() => { reloadData(); }, 60000);
    reloadData();
});
