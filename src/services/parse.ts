import { XMLParser } from "fast-xml-parser";
import { unzip } from "unzipit";
import type { Metadata } from "./types";

let sections: { id: string, href: string }[] = [];
let images: { name: string, url: string }[] = [];
let htmls: { name: string, html: string }[] = [];
let styles: { name: string, css: string }[] = [];
let fonts: { name: string, url: string }[] = [];
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
                const url = URL.createObjectURL(blob);
                images.push({ name, url });
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
                const url = URL.createObjectURL(blob);
                fonts.push({ name, url });
            }
            default: break;
        }
    }

    return opf;
}

const parseMeta = (meta: object) => {
    const title = meta["dc:title"];
    const author = meta["dc:creator"];
    let cover = images[0].url;
    for (let { name, url } of images) {
        if (name.includes(coverFilename)) {
            cover = url;
            break;
        } else if (name.includes("cover")) {
            cover = url;
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
