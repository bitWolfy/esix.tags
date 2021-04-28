
export class TagValidator {

    private static metatags = ["user", "approver", "commenter", "comm", "noter", "noteupdater", "artcomm?", "pool", "ordpool", "fav", "favoritedby", "md5", "rating", "note", "locked", "width", "height", "mpixels", "ratio", "score", "favcount", "filesize", "source", "id", "date", "age", "order", "limit", "status", "tagcount", "parent", "child", "pixiv_id", "pixiv", "search", "upvote", "downvote", "voted", "filetype", "flagger", "type", "appealer", "disapproval", "set", "randseed", "description", "change", "user_id", "delreason", "deletedby", "votedup", "voteddown", "duration"];
    private static metatagsRegex = new RegExp(`^(${TagValidator.metatags.join("|")}):(.+)$`, "i");

    private static categories = ["general", "species", "character", "copyright", "artist", "invalid", "lore", "meta"];
    private static categoriesRegex = new RegExp(`^(${TagValidator.categories.join("|")}):(.+)$`, "i");

    private static validation: [RegExp, string][] = [
        [/\*/, "Tag cannot contain asterisks ('*')"],
        [/,/, "Tag cannot contain commas (',')"],
        [/#/, "Tag cannot contain octothorpes ('#')"],
        [/\$/, "Tag cannot contain peso signs ('$')"],
        [/%/, "Tag cannot contain percent signs ('%')"],
        [/\\/, "Tag cannot contain back slashes ('\\')"],
        [/[_\-~]{2}/, "Tag cannot contain consecutive underscores, hyphens or tildes"],
        [/[\x00-\x1F]/, "Tag cannot contain non-printable characters"],
        [/^([-~+:_`\(\){}\[\]\/])/, "Tag cannot begin with %MATCHNAME% ('%MATCH%')"],
        [/([_])$/, "Tag cannot end with %MATCHNAME% ('%MATCH%')"],
        [TagValidator.metatagsRegex, "Tag cannot begin with '%MATCH%:'"],
        [TagValidator.categoriesRegex, "Tag cannot begin with '%MATCH%:'"],
    ];

    private static charnames = {
        "-": "a dash",
        "~": "a tilde",
        "+": "a plus sign",
        ":": "a colon",
        "_": "an underscore",
        "`": "a backtick",
        "(": "a bracket",
        ")": "a bracket",
        "{": "a brace",
        "}": "a brace",
        "[": "a square bracket",
        "]": "a square bracket",
        "/": "a slash",
    };

    public static run(tag: string): string[] {

        const errors = [];

        if (tag.length == 0) return [];

        if (TagValidator.hasUnicode(tag))
            errors.push("Tag can only contain ASCII characters");

        if (/[ \n\r\t]+/.test(tag))
            errors.push("Tag cannot contain spaces, tabs, or newlines");

        for (const check of TagValidator.validation) {
            const match = tag.match(check[0]);
            if (!match) continue;
            errors.push(check[1].replace("%MATCHNAME%", TagValidator.charnames[match[1]]).replace("%MATCH%", match[1]));
        }

        return errors;
    }

    public static hasInvalidCharacters(tag: string): boolean {
        if (TagValidator.hasUnicode(tag)) return true;

        if (/[ \n\r\t]+/.test(tag)) return true;

        for (const check of TagValidator.validation) {
            const match = tag.match(check[0]);
            if (match) return true;
        }

        return false;
    }

    public static hasUnicode(tag: string): boolean {
        return [...tag].some(char => char.charCodeAt(0) > 127);
    }

    public static hasJapanese(tag: string): boolean {
        return /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/.test(tag);
    }

    public static hasUppercase(tag: string): boolean {
        return tag.toLocaleLowerCase() !== tag;
    }

}
