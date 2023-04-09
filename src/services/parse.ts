import { unzip } from "unzipit";
import type { Metadata, Book, TOCItem } from "./types";
const domParser = new DOMParser();

const parseOpf = (opf: string, images: Map<string, Blob>): { meta: Metadata, spine: string[] } => {
    const parsed = domParser.parseFromString(opf, "text/xml");

    const { title, author, coverId } = parseMeta(parsed.querySelector("metadata"));
    const manifestItems = parseManifest(parsed.querySelector("manifest"));
    const spine = parseSpine(parsed.querySelector("spine"), manifestItems);
    const cover = manifestItems.has(coverId) ? images.get(manifestItems.get(coverId)) : undefined;

    return { meta: { title, author, cover }, spine };
}

interface extractInterface {
    images: Map<string, Blob>,
    htmls: Map<string, string>,
    styles: Map<string, string>,
    fonts: Map<string, Blob>,
    tocNcx: string,
    opf: string
}

const extract = async (file: File): Promise<extractInterface> => {
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

const removePath = (filename: string): string => {
    return decodeURI(filename.split('\\').pop().split('/').pop());
}

const getCoverFromFirstPage = (firstPageHTML: string, images: Map<string, Blob>): Blob => {
    // Fallback to taking image from first page if no cover from opf metadata.
    // Should only be used if no cover from opf metadata.
    const temp = domParser.parseFromString(firstPageHTML,
        "application/xhtml+xml").querySelector("img");
    if (temp && temp.hasAttribute("src")) {
        return images.get(removePath(temp.getAttribute("src")));
    } else {
        return undefined;
    }
}

const updateHTML = (html: string): string => {
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
                if (e.getAttribute("src") !== null && !e.getAttribute("src").includes("http")) {
                    e.removeAttribute("src");
                }
                break;
            }
        }
    }

    return newHTML.body.innerHTML;
}

const cssNester = (css: string, nestWith: string): string => {
    // Found on Stackoverflow and works great: https://stackoverflow.com/a/67517828
    let kframes = [];
    css = css.replace(/@(-moz-|-webkit-|-ms-)*keyframes\s(.*?){([0-9%a-zA-Z,\s.]*{(.*?)})*[\s\n]*}/g, x => kframes.push(x) && '__keyframes__');
    css = css.replace(/([^\r\n,{}]+)(,(?=[^}]*{)|\s*{)/g, x => x.trim()[0] === '@' ? x : x.replace(/(\s*)/, '$1' + nestWith + ' '));
    return css.replace(/__keyframes__/g, x => kframes.shift());
}

interface Content {
    index: number;
    html: string;
}

const parseToc = (tocNcx: string, contents: Map<string, Content>): TOCItem[] => {
    const TOC: TOCItem[] = [];
    const navmap = domParser.parseFromString(tocNcx, "application/xml").querySelectorAll("navPoint");
    for (const navpoint of navmap) {
        const name = navpoint.querySelector("text").textContent;
        let href = removePath(navpoint.querySelector("content").attributes["src"].value);
        if (href.includes("#")) {
            href = href.substring(0, href.indexOf("#")); // Necessary since some books have hash URLs for part of chapter
        }
        const index = contents.get(href).index;
        const isChild = navpoint.parentElement.nodeName === "navPoint"
        TOC.push({ name, index, isChild });
    }
    return TOC;
};

export const parseEpub = async (epub: File): Promise<Book> => {
    try {
        const { images, htmls, styles, fonts, tocNcx, opf } = await extract(epub)
        const { meta, spine } = parseOpf(opf, images);

        if (meta.cover === undefined) {
            meta.cover = getCoverFromFirstPage(htmls.get(spine[0]), images);
        }

        const contents: Map<string,Content> = new Map();
        spine.forEach((href, index) => {
            contents.set(href, { index, html: htmls.has(href) ? updateHTML(htmls.get(href)) : null });
        });

        const toc: TOCItem[] = parseToc(tocNcx, contents);

        return { meta, contents, spine, toc, files: { images, fonts, styles }, progress: 0 };

    } catch (e) {
        throw new Error(epub.name + " does not appear to be a valid EPUB file");
    }
}