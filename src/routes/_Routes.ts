import { DefaultRoute } from "./Default";
import { CountRoute } from "./tags/TagsCount";
import { FindRoute } from "./tags/TagsFind";
import { TagsIndex } from "./tags/TagsIndex";
import { InfoRoute } from "./tags/TagsInfo";
import { ListRoute } from "./tags/TagsList";

export const pageRoutes: any[] = [
    DefaultRoute,

    TagsIndex,
    ListRoute,
    FindRoute,
    InfoRoute,
    CountRoute,
]
