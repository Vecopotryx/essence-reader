import { XMLParser } from "fast-xml-parser";
import { unzip } from "unzipit";
import type { Metadata } from "./types";

let sections: { id: string, href: string }[] = [];
let images: { name: string, blob: Blob }[] = [];
let htmls: { name: string, html: string }[] = [];
let styles: { name: string, css: string }[] = [];
let fonts: { name: string, blob: Blob }[] = [];
let coverFilename: string = "";

let meta: Metadata;

const parseOpf = (xml: string) => {
    const parsedAtt = new XMLParser({ ignoreAttributes: false }).parse(xml)["package"];

    const manifestSections = parseManifest(parsedAtt["manifest"]);

    const parsed = new XMLParser().parse(xml)["package"];

    meta = parseMeta(parsed["metadata"] === undefined ? parsed["opf:metadata"] : parsed["metadata"]);

    parseSpine(parsedAtt["spine"], manifestSections);

}

export const parser = async (epub: any) => {
    images = [];
    sections = [];
    htmls = [];
    fonts = [];
    parseOpf(await extract(epub));

    return { meta, extracted: { sections, htmls, images, fonts, styles } };
}

const extract = async (file: any) => {
    const { entries } = await unzip(file);

    let opf = "";
    for (const [name, entry] of Object.entries(entries)) {
        switch (name.substring(name.lastIndexOf("."))) {
            case ".opf":
                opf = await entry.text();
                break;
            case ".png":
            case ".jpg":
            case ".jpeg":
            case ".gif": {
                const blob = await entry.blob();
                images.push({ name, blob });
                break;
            }
            case ".css": {
                const css = await entry.text();
                styles.push({ name, css });
                break;
            }
            case ".htm":
            case ".xml":
            case ".html":
            case ".xhtml": {
                const html = await entry.text();
                htmls.push({ name, html });
                break;
            }
            case ".otf":
            case ".ttf":
            case ".woff": {
                const blob = await entry.blob();
                fonts.push({ name, blob });
            }
            default: break;
        }
    }

    return opf;
}

const parseMeta = (meta: object) => {
    const title = meta["dc:title"];
    const author = meta["dc:creator"];
    let cover = images[0].blob;
    for (let { name, blob } of images) {
        if (name.includes(coverFilename)) {
            cover = blob;
            break;
        } else if (name.includes("cover")) {
            cover = blob;
        }
    }
    return { title, author, cover };
}

const parseManifest = (manifest: object) => {
    let tempSections: { id: string, href: string }[] = [];

    manifest["item"].forEach(element => {
        if (element["@_media-type"] === "application/xhtml+xml" || element["@_media-type"] === "text/html") {
            tempSections.push({ id: element["@_id"], href: element["@_href"] });
        } else if (element["@_media-type"].includes("image") && element["@_id"].includes("cover")) {
            coverFilename = element["@_href"];
        }
    });

    return tempSections;
}

const parseSpine = (spine: object, manifestSec: any) => {
    let sortArr = [];
    spine["itemref"].forEach(obj => {
        sortArr.push(obj["@_idref"]);
    });

    sections = sortArr.map((i) => manifestSec.find((j) => j.id === i));
}
