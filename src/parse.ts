import { XMLParser } from "fast-xml-parser";
import { unzip } from "unzipit";

interface Metadata {
    title: string;
    author: string[];
}

export type Book = {
    meta: Metadata,
    contents: string[],
    styles: string[]
}


let sections = [];
let contents = [];
let images = [];
let htmls = [];
let styles = [];

let meta: Metadata;

const parseOpf = (xml: string) => {

    const parsed = new XMLParser().parse(xml)["package"];

    meta = parseMeta(parsed["metadata"] === undefined ? parsed["opf:metadata"] : parsed["metadata"]);

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
    return { meta, contents, styles }

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
            case ".css":
                const css = await entry.text();
                styles.push(css);
                break;
            case ".htm":
            case ".xml":
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

const parseMeta = (meta: object) => {
    const title = meta["dc:title"];
    const author = meta["dc:creator"];
    return { title, author };
}


const parseManifest = (manifest: object) => {
    let tempSection = [];

    manifest["item"].forEach(element => {
        if (element["@_media-type"] === "application/xhtml+xml" || element["@_media-type"] === "text/html") {
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

const updateHTML = (html: string) => {
    let newHTML = document.createElement('newHTML');
    newHTML.innerHTML = html.trim();
    for (let e of newHTML.getElementsByTagName("img")) {
        let index = -1;
        let filename = e.src.split('\\').pop().split('/').pop();
        for (let i = 0; i < images.length; i++) {
            if (images[i].name.includes(filename)) {
                index = i;
                break;
            }
        }
        if (index != -1) {
            e.src = images[index].url;
        } else {
            e.remove();
        }
    }

    return newHTML.innerHTML;
}

const assembleContent = () => {
    for (let i = 0; i < sections.length; i++) {
        for (const [name, text] of htmls) {
            if (name.includes(sections[i].href)) {
                contents.push(updateHTML(text));
                break;
            }
        }
    }
}