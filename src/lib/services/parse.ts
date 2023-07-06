import { unzip, type ZipInfo } from "unzipit";
import type { Metadata, Book, TOCItem } from "./types";
const domParser = new DOMParser();

const parseOpf = (opf: string): { meta: Metadata, spine: string[] } => {
    const parsed = domParser.parseFromString(opf, "text/xml");

    const { title, author, coverId } = parseMeta(parsed.querySelector("metadata"));
    const manifestItems = parseManifest(parsed.querySelector("manifest"));
    const spine = parseSpine(parsed.querySelector("spine"), manifestItems);
    const coverFile = manifestItems.has(coverId) ? manifestItems.get(coverId) : undefined;

    return { meta: { title, author, coverFile }, spine };
}

interface extractInterface {
    tocNcx: string,
    opf: string,
    entries: ZipInfo["entries"]
}


let opfLocation = ""
let ncxLocation = ""

const getFilePath = (path: string) => {
    const lastIndex = path.lastIndexOf('/');
    return path.substring(0, lastIndex + 1);
}

const extract = async (file: File): Promise<extractInterface> => {
    const { entries } = await unzip(file);

    let tocNcx: string = "";
    let opf: string = "";

    for (const [name, entry] of Object.entries(entries)) {
        switch (name.substring(name.lastIndexOf("."))) {
            case ".opf":
                opf = await entry.text();
                opfLocation = getFilePath(name);
                break;
            case ".ncx": {
                tocNcx = await entry.text();
                ncxLocation = getFilePath(name);
                break;
            }
            default: break;
        }
    }

    return { tocNcx, opf, entries };
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
        manifestItems.set(item.attributes["id"].value, opfLocation + item.attributes["href"].value);
    }

    return manifestItems;
}

const parseSpine = (spine: Element, manifestItems: Map<string, string>): string[] => {
    return Array.from(spine.children).map(x => manifestItems.get(x.attributes["idref"].value));
}


const getCoverFromFirstPage = (firstPageHTML: string, images: Map<string, Blob>): Blob => {
    // Fallback to taking image from first page if no cover from opf metadata.
    // Should only be used if no cover from opf metadata.
    const temp = domParser.parseFromString(firstPageHTML,
        "application/xhtml+xml").querySelector("img");
    if (temp && temp.hasAttribute("src")) {
        return images.get(temp.getAttribute("src"));
    } else {
        return undefined;
    }
}

const parseToc = (tocNcx: string, spine: string[]): TOCItem[] => {
    const TOC: TOCItem[] = [];
    const navmap = domParser.parseFromString(tocNcx, "application/xml").querySelectorAll("navPoint");
    for (const navpoint of navmap) {
        const name = navpoint.querySelector("text").textContent;
        let href = navpoint.querySelector("content").attributes["src"].value;
        if (href.includes("#")) {
            href = href.substring(0, href.indexOf("#")); // Necessary since some books have hash URLs for part of chapter
        }
        const index = spine.indexOf(href);
        const isChild = navpoint.parentElement.nodeName === "navPoint"
        TOC.push({ name, index, isChild });
    }
    return TOC;
};


export const parseEpub = async (epub: File): Promise<Book> => {
    try {
        const { tocNcx, opf, entries } = await extract(epub)
        const { meta, spine } = parseOpf(opf);

        // if (meta.cover === undefined) {
        //     meta.cover = getCoverFromFirstPage(htmls.get(spine[0]), images);
        // }

        meta.cover = await entries[meta.coverFile].blob('image/png');

        const toc: TOCItem[] = parseToc(tocNcx, spine);

        return { meta, spine, toc, progress: 0, file: epub };

    } catch (e) {
        throw new Error(epub.name + " does not appear to be a valid EPUB file");
    }
}