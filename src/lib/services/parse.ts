import { unzip, type ZipInfo } from "unzipit";
import type { Metadata, Book, TOCItem } from "$lib/types";
const domParser = new DOMParser();

const parseOpf = (opf: string): { title: string, author: string[], coverFile: string | undefined, spine: string[] } => {
    const parsed = domParser.parseFromString(opf, "text/xml");

    const { title, author, coverId } = parseMeta(parsed.querySelector("metadata"));
    const manifestItems = parseManifest(parsed.querySelector("manifest"));
    const spine = parseSpine(parsed.querySelector("spine"), manifestItems);
    const coverFile = manifestItems.has(coverId) ? manifestItems.get(coverId) : undefined;

    return { title, author, coverFile, spine };
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
    console.log(tocNcx);
    console.log(opf);
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



const getCoverFromFirstPage = (firstPageHTML: string, relativeTo: string): string => {
    // Fallback to taking image from first page if no cover from opf metadata.
    // Should only be used if no cover from opf metadata.

    const temp = domParser.parseFromString(firstPageHTML,
        "application/xhtml+xml").querySelector("img");
    if (temp && temp.hasAttribute("src")) {
        const path = temp.getAttribute("src");
        const basePath = "http://localhost/" + relativeTo;
        const resolvedPath = new URL(path, basePath).pathname.slice(1);

        return resolvedPath;
    } else {
        return "";
    }
}

const relativeToAbsAndHash = (path: string, relativeTo: string) => {
    const url = new URL(path, `http://localhost/${relativeTo}`);
    return { path: url.pathname.slice(1), hash: url.hash };
}

const parseToc = (tocNcx: string, spine: string[]): TOCItem[] => {
    const TOC: TOCItem[] = [];
    const navmap = domParser.parseFromString(tocNcx, "application/xml").querySelectorAll("navPoint");
    for (const navpoint of navmap) {
        const name = navpoint.querySelector("text").textContent;
        let href = navpoint.querySelector("content").attributes["src"].value;
        const { path, hash } = relativeToAbsAndHash(href, ncxLocation);
        const index = spine.indexOf(path);
        const isChild = navpoint.parentElement.nodeName === "navPoint"
        TOC.push({ name, index,  href: path + hash, isChild });
    }
    console.log(TOC);
    return TOC;
};


export const parseEpub = async (epub: File): Promise<{ meta: Metadata, book: Book }> => {
    try {
        const { tocNcx, opf, entries } = await extract(epub)
        const { title, author, coverFile, spine } = parseOpf(opf);
        const toc: TOCItem[] = parseToc(tocNcx, spine);
        let cover: Blob | undefined;

        try {
            if (coverFile === undefined) {
                const firstPageImage = getCoverFromFirstPage(await entries[spine[0]].text(), spine[0]);
                cover = await entries[firstPageImage].blob();
            } else {
                cover = await entries[coverFile].blob();
            }
        } catch (e) {
            cover = undefined;
        }

        const meta: Metadata = { title, author, cover, progress: 0 };
        const book: Book = { spine, toc, file: epub };

        return { meta, book };

    } catch (e) {
        console.error(e);
        throw new Error(epub.name + " does not appear to be a valid EPUB file");
    }
}