import { DefaultRoute } from "./Default";
import { FindRoute } from "./Find";
import { InfoRoute } from "./Info";
import { ListRoute } from "./List";
import { TagsIndex } from "./tags/TagsIndex";

export const pageRoutes: any[] = [
    DefaultRoute,

    TagsIndex,
    ListRoute,
    FindRoute,
    InfoRoute,
]
