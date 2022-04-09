import { XMLParser } from "fast-xml-parser";

interface Metadata {
    title: string;
    author: string[];
}

export type Book = {
    meta: Metadata
}

export const parseOpf = (xml: string) => {
    //const options = { ignoreAttributes: false };
    const parsed = new XMLParser().parse(xml)["package"];
    console.log(parsed);

    const meta: Metadata = parseMeta(parsed["metadata"]);

    return { meta }
}

const parseMeta = (meta: object) => {
    const title = meta["dc:title"];
    const author =  meta["dc:creator"];
    return { title, author };
}