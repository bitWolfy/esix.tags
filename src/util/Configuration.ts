
export class Configuration {

    public static dbFileName = "wf_lookup.db";      // name of the database file, in the /data/ directory
    public static dbRegExpEnabled = false;          // enable faster regex-based lookups. might not be supported.

    public static tagResponseLimit = 25000;         // maximum number of tags that the API will ever return

}
