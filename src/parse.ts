import { XMLParser } from "fast-xml-parser";
import { unzip } from "unzipit";

interface Metadata {
    title: string;
    author: string[];
}

export type Book = {
    meta: Metadata,
    contents: string[]
}


let sections = [];
let contents = [];
let images = [];
let htmls = [];

let meta: Metadata;

const parseOpf = (xml: string) => {

    const parsed = new XMLParser().parse(xml)["package"];

    meta = parseMeta(parsed["metadata"]);

    const parsedAtt = new XMLParser({ ignoreAttributes: false }).parse(xml)["package"];

    const manifestSections = parseManifest(parsedAtt["manifest"]);

    parseSpine(parsedAtt["spine"], manifestSections);
}

export const parser = async (epub: any) => {
    contents = [];
    images = [];
    sections = [];
    htmls = [];
    parseOpf(await extract(epub));
    assembleContent();
    return { meta, contents }

}


const extract = async (file: any) => {
    const { entries } = await unzip(file);

    let opf = "";

    for (const [name, entry] of Object.entries(entries)) {
        switch (name.substring(name.lastIndexOf("."))) {
            case ".opf":
                opf = await entry.text();
                break;
            case ".jpg":
            case ".jpeg":
            case ".gif":
                const blob = await entry.blob();
                const url = URL.createObjectURL(blob);
                images.push({ name, url });
                break;
            case ".html":
            case ".xhtml":
                const text = await entry.text();
                htmls.push([name, text]);
                break;
            default: break;
        }
    }
    return opf;
}


const updateHTML = (html: string, images: any) => {
    let modified = html.replace(/<img [^>]*src=['"]([^'"]+)[^>]*>/gi, function (match, source) {

        let index = 0;
        let filename = source.split('\\').pop().split('/').pop();
        for (let i = 0; i < images.length; i++) {
            if (images[i].name.includes(filename)) {
                index = i;
            }
        }

        return "<img src=" + images[index].url + "><img/>";
    });

    return modified;
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

const assembleContent = () => {
    for (let i = 0; i < sections.length; i++) {
        for (const [name, text] of htmls) {
            if (name.includes(sections[i].href)) {
                contents.push(updateHTML(text, images));
                break;
            }
        }
    }
}