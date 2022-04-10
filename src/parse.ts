import { XMLParser } from "fast-xml-parser";

interface Metadata {
    title: string;
    author: string[];
}

export type Book = {
    meta: Metadata,
    htmls: string[]
}


let sections = [];
let htmls = [];


export const parseOpf = (xml: string, entries: any) => {
    sortEntries(entries);
    console.log(images);

    const parsed = new XMLParser().parse(xml)["package"];

    const meta: Metadata = parseMeta(parsed["metadata"]);

    const parsedAtt = new XMLParser({ ignoreAttributes: false }).parse(xml)["package"];

    const manifestSections = parseManifest(parsedAtt["manifest"]);

    parseSpine(parsedAtt["spine"], manifestSections);

    assembleContent(entries);


    return { meta, htmls }
}


let images = [];

const sortEntries = (entries: any) => {
    for (const [name, entry] of entries) {
        if (
            name.endsWith(".jpg") ||
            name.endsWith(".jpeg") ||
            name.endsWith(".gif")
        ) {
            const blob = entry.blob();
            images.push({ name, blob });
        }
    }
}

const parseMeta = (meta: object) => {
    const title = meta["dc:title"];
    const author = meta["dc:creator"];
    return { title, author };
}


const parseManifest = (manifest: object) => {
    let tempSection = [];

    manifest["item"].forEach(element => {
        if (element["@_media-type"] === "application/xhtml+xml") {
            tempSection.push({ id: element["@_id"], href: element["@_href"] });
        }
    });

    return tempSection;
}

const parseSpine = (spine: object, manifestSec: any) => {
    let sortArr = [];
    spine["itemref"].forEach(obj => {
        sortArr.push(obj["@_idref"]);
    });

    sections = sortArr.map((i) => manifestSec.find((j) => j.id === i));
}

const assembleContent = (entries: any) => {
    for (let i = 0; i < sections.length; i++) {
        for (const [name, entry] of entries) {
            if (name.includes(sections[i].href)) {
                htmls.push(entry.text());
                break;
            }
        }
    }
}