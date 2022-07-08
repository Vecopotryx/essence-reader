import { XMLParser } from "fast-xml-parser";
import { unzip } from "unzipit";

interface Metadata {
    title: string;
    author: string[];
}

export type Book = {
    meta: Metadata,
    contents: string[],
    styles: { name: string, css: string }[]
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


const cssNester = (css: string, nestWith: string) => {
    // Found on Stackoverflow and works great: https://stackoverflow.com/a/67517828
    let kframes = [];
    css = css.replace(/@(-moz-|-webkit-|-ms-)*keyframes\s(.*?){([0-9%a-zA-Z,\s.]*{(.*?)})*[\s\n]*}/g, x => kframes.push(x) && '__keyframes__');
    css = css.replace(/([^\r\n,{}]+)(,(?=[^}]*{)|\s*{)/g, x => x.trim()[0] === '@' ? x : x.replace(/(\s*)/, '$1' + nestWith + ' '));
    return css.replace(/__keyframes__/g, x => kframes.shift());
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
            case ".gif":
                const blob = await entry.blob();
                const url = URL.createObjectURL(blob);
                images.push({ name, url });
                break;
            case ".css": {
                const text = await entry.text();
                const css = cssNester(text, "#container")
                styles.push({ name, css });
                break;
            }
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

    for (let e of newHTML.querySelectorAll<HTMLElement>('[src],[href]')) {
        switch (e.tagName) {
            case "IMG": {
                let filename = e.getAttribute("src").split('\\').pop().split('/').pop();
                for (let i = 0; i < images.length; i++) {
                    if (images[i].name.includes(filename)) {
                        e.setAttribute("src", images[i].url);
                        break;
                    }
                }
                e.style.cssText += 'max-height: 100%; max-width: 100%; object-fit: scale-down;';
                break;
            }

            default: {
                if (e.getAttribute("href") !== null && !e.getAttribute("href").includes("http")) {
                    e.removeAttribute("href");
                }
                if (e.getAttribute("src") !== null && !e.getAttribute("src").includes("http")) {
                    e.removeAttribute("src");
                }
                break;
            }
        }
    }

    for (let e of newHTML.getElementsByTagName("image")) {
        let filename = e.getAttributeNS('http://www.w3.org/1999/xlink', 'href').split('\\').pop().split('/').pop();
        for (let i = 0; i < images.length; i++) {
            if (images[i].name.includes(filename)) {
                e.setAttributeNS('http://www.w3.org/1999/xlink', 'href', images[i].url);
                break;
            }
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