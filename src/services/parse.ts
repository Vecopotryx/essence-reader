import { unzip } from "unzipit";
import type { Metadata, Book, TOC } from "./types";
const domParser = new DOMParser();

const parseOpf = (xml: string, images: Map<string, Blob>): { meta: Metadata, sections: { id: string, href: string }[] } => {
    const parsed = domParser.parseFromString(xml, "text/xml");

    const { manifestSections, coverFilename } = parseManifest(parsed.querySelector("manifest").children)
    const meta = parseMeta(parsed.querySelector("metadata"), images, coverFilename)

    const sections = parseSpine(parsed.querySelector("spine"), manifestSections);
    return { meta, sections };
}

const extract = async (file: File) => {
    const { entries } = await unzip(file);

    const images: Map<string, Blob> = new Map();
    const htmls: Map<string, string> = new Map();
    const styles: Map<string, string> = new Map();
    const fonts: Map<string, Blob> = new Map();
    let tocNcx: string = "";
    let opf: string = "";

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
                images.set(removePath(name), blob);
                break;
            }
            case ".css": {
                const css = await entry.text();
                styles.set(name, cssNester(css, "#container"));
                break;
            }
            case ".htm":
            case ".xml":
            case ".html":
            case ".xhtml": {
                const html = await entry.text();
                htmls.set(removePath(name), html);
                break;
            }
            case ".otf":
            case ".ttf":
            case ".woff": {
                const blob = await entry.blob();
                fonts.set(removePath(name), blob);
                break;
            }
            case ".ncx": {
                tocNcx = await entry.text();
                break;
            }
            default: break;
        }
    }

    return { images, htmls, styles, fonts, tocNcx, opf };
}

const parseMeta = (meta: Element, images: Map<string, Blob>, coverFilename: string) => {
    const title = meta.querySelector("title").textContent;
    const author = [];
    for (let author2 of meta.querySelectorAll("creator")) {
        author.push(author2.textContent);
    }
    let keys = Array.from(images.keys());
    let cover: Blob = images.get(keys[0]);
    for (let key of keys) {
        if (key === coverFilename) {
            cover = images.get(key);
            break;
        } else if (key.includes("cover")) {
            cover = images.get(key);
        }
    }
    return { title, author, cover };
}

const parseManifest = (manifest: HTMLCollection): { manifestSections: { id: string, href: string }[], coverFilename: string } => {
    const manifestSections: { id: string, href: string }[] = [];
    let coverFilename: string = "";

    for (const item of manifest) {
        if (item.attributes["media-type"].value === "application/xhtml+xml") {
            manifestSections.push({ id: item.attributes["id"].value, href: removePath(item.attributes["href"].value) });
        } else if (item.attributes["media-type"].value.includes("image") && item.attributes["id"].value.includes("cover")) {
            coverFilename = removePath(item.attributes["href"].value);
        }
    }

    return { manifestSections, coverFilename };
}

const parseSpine = (spine: Element, manifestSec: { id: string, href: string }[]): { id: string, href: string }[] => {
    const sortArr = [];
    spine.querySelectorAll("itemref").forEach(obj => sortArr.push(obj.attributes["idref"].value));

    return sortArr.map((i) => manifestSec.find((j) => j.id === i));
}

const removePath = (filename: string) => {
    return decodeURI(filename.split('\\').pop().split('/').pop());
}

const updateHTML = (html: string) => {
    let newHTML = domParser.parseFromString(html, "application/xhtml+xml");

    const errorNode = newHTML.querySelector('parsererror');
    if (errorNode) {
        // Try parsing as HTML if error when parsing as XHTML.
        // Can solve issues with mismatched tags
        newHTML = domParser.parseFromString(html, "text/html");
    }
    for (const e of newHTML.querySelectorAll<HTMLElement>('[src],[href], image')) {
        switch (e.tagName) {
            case "img": {
                const filename = removePath(e.getAttribute("src"));
                e.setAttribute("src", "ESSENCE-READER-IMAGE-" + filename);
                e.style.cssText += 'max-height: 100%; max-width: 100%; object-fit: scale-down;';
                break;
            }

            case "image": {
                const filename = removePath(e.getAttributeNS('http://www.w3.org/1999/xlink', 'href'));
                e.setAttributeNS('http://www.w3.org/1999/xlink', 'href', "ESSENCE-READER-IMAGE-" + filename);
                break;
            }

            default: {
                if (e.getAttribute("href") !== null && !e.getAttribute("href").includes("http")) {
                    e.removeAttribute("href");
                } else if (e.getAttribute("src") !== null && !e.getAttribute("src").includes("http")) {
                    e.removeAttribute("src");
                }
                break;
            }
        }
    }

    return newHTML.body.innerHTML;
}

const cssNester = (css: string, nestWith: string) => {
    // Found on Stackoverflow and works great: https://stackoverflow.com/a/67517828
    let kframes = [];
    css = css.replace(/@(-moz-|-webkit-|-ms-)*keyframes\s(.*?){([0-9%a-zA-Z,\s.]*{(.*?)})*[\s\n]*}/g, x => kframes.push(x) && '__keyframes__');
    css = css.replace(/([^\r\n,{}]+)(,(?=[^}]*{)|\s*{)/g, x => x.trim()[0] === '@' ? x : x.replace(/(\s*)/, '$1' + nestWith + ' '));
    return css.replace(/__keyframes__/g, x => kframes.shift());
}

type TOCType = {
    name: string,
    href: string,
    isChild: boolean
}

const parseToc = (tocNcx: string): TOCType[] => {
    const array = []
    const navmap = domParser.parseFromString(tocNcx, "application/xml").querySelectorAll("navPoint");
    for (const navpoint of navmap) {
        let name = navpoint.querySelector("text").textContent;
        let href = decodeURI(navpoint.querySelector("content").attributes["src"].value);
        const isChild = navpoint.parentElement.nodeName === "navPoint"
        array.push({ name, href, isChild })
    }
    return array;
}

export const parser = async (epub: File): Promise<Book> => {
    try {
        const { images, htmls, styles, fonts, tocNcx, opf } = await extract(epub)
        const { meta, sections } = parseOpf(opf, images);

        const contentIndexes: { href: string, index: number }[] = [];
        const contents: string[] = [];
        for (let i = 0; i < sections.length; i++) {
            contents.push(updateHTML(htmls.get(sections[i].href)));
            contentIndexes.push({ href: sections[i].href, index: i })
        }


        const toc: TOC[] = [];
        for (const { name, href: tocHref, isChild } of parseToc(tocNcx)) {
            for (const { href, index } of contentIndexes) {
                if (tocHref.includes(removePath(href))) {
                    toc.push({ name, index, isChild })
                }
            }
        }

        return { meta, contents, toc, files: { images, fonts, styles }, progress: 0 };

    } catch (e) {
        throw new Error(epub.name + " does not appear to be a valid EPUB file");
    }
}