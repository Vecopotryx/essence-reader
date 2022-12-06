import { unzip } from "unzipit";
import type { Metadata, Book, TOC } from "./types";
const domParser = new DOMParser();

const parseOpf = (opf: string, images: Map<string, Blob>): { meta: Metadata, sections: string[] } => {
    const parsed = domParser.parseFromString(opf, "text/xml");

    const { title, author, coverId } = parseMeta(parsed.querySelector("metadata"));
    const manifestItems = parseManifest(parsed.querySelector("manifest"));
    const sections = parseSpine(parsed.querySelector("spine"), manifestItems);
    const cover = manifestItems.has(coverId) ? images.get(manifestItems.get(coverId)) : undefined;

    return { meta: { title, author, cover }, sections };
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

const parseMeta = (meta: Element): { title: string, author: string[], coverId: string | undefined } => {
    const title: string = meta.querySelector("title").textContent;
    const author: string[] = Array.from(meta.querySelectorAll("creator")).map(v => v.textContent);
    const coverId: string | undefined = meta.querySelector("[name='cover']")?.attributes["content"].value;
    return { title, author, coverId };
}

const parseManifest = (manifest: Element): Map<string, string> => {
    const manifestItems: Map<string, string> = new Map();

    for (const item of manifest.children) {
        manifestItems.set(item.attributes["id"].value, removePath(item.attributes["href"].value));
    }

    return manifestItems;
}

const parseSpine = (spine: Element, manifestItems: Map<string, string>): string[] => {
    return Array.from(spine.children).map(x => manifestItems.get(x.attributes["idref"].value));
}

const removePath = (filename: string) => {
    return decodeURI(filename.split('\\').pop().split('/').pop());
}

const getCoverFromFirstPage = (firstPageHTML: string, images: Map<string, Blob>) => {
    // Fallback to taking image from first page if no cover from opf metadata.
    // Should only be used if no cover from opf metadata.
    const temp = domParser.parseFromString(firstPageHTML,
        "application/xhtml+xml").querySelector("img");
    if (temp.hasAttribute("src")) {
        return images.get(removePath(temp.getAttribute("src")));
    } else {
        return undefined;
    }
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

const parseToc = (tocNcx: string): Map<string, TOC> => {
    const tocmap: Map<string, TOC> = new Map();
    const navmap = domParser.parseFromString(tocNcx, "application/xml").querySelectorAll("navPoint");
    for (const navpoint of navmap) {
        const name = navpoint.querySelector("text").textContent;
        const href = removePath(navpoint.querySelector("content").attributes["src"].value);
        const isChild = navpoint.parentElement.nodeName === "navPoint"
        tocmap.set(href, { name, index: 0, isChild })
    }
    return tocmap;
}

export const parser = async (epub: File): Promise<Book> => {
    try {
        const { images, htmls, styles, fonts, tocNcx, opf } = await extract(epub)
        const { meta, sections } = parseOpf(opf, images);
        const toc: TOC[] = [];
        const parsedToc = parseToc(tocNcx);

        if (meta.cover === undefined) {
            meta.cover = getCoverFromFirstPage(htmls.get(sections[0]), images);
        }

        const contents: string[] = sections.map((href, index) => {
            if (parsedToc.has(href)) {
                const tempToc: TOC = parsedToc.get(href);
                tempToc.index = index;
                toc.push(tempToc);
            }
            return htmls.has(href) ? updateHTML(htmls.get(href)) : null
        });

        return { meta, contents, toc, files: { images, fonts, styles }, progress: 0 };

    } catch (e) {
        throw new Error(epub.name + " does not appear to be a valid EPUB file");
    }
}