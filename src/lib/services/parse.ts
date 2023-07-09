import { unzip, type ZipInfo } from "unzipit";
import type { Metadata, Book, TableOfContentsItem } from "$lib/types";
const domParser = new DOMParser();

const parseOpf = (opf: string): { title: string, author: string[], coverFile: string | undefined, spine: string[] } => {
    const parsed = domParser.parseFromString(opf, "text/xml");

    const metadata = parsed.querySelector("metadata");
    const { title, author, coverId } = metadata ? parseMeta(metadata) : { title: "", author: [], coverId: undefined };

    const manifestElement = parsed.querySelector("manifest");
    if (!manifestElement) throw new Error("Manifest element not found in OPF");

    const manifestItems = parseManifest(manifestElement);

    const spineElement = parsed.querySelector("spine");
    if (!spineElement) throw new Error("Spine element not found in OPF");

    const spine = parseSpine(spineElement, manifestItems);

    let coverFile: string | undefined;
    if (coverId && manifestItems.has(coverId)) {
        coverFile = manifestItems.get(coverId);
    } else {
        coverFile = undefined;
    }

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

    let tocNcx = "";
    let opf = "";

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
    const titleElement: Element | null = meta.querySelector("title");
    const title: string = titleElement?.textContent || "";

    const authorElements: NodeListOf<Element> = meta.querySelectorAll("creator");
    const author: string[] = Array.from(authorElements).map((v: Element) => v.textContent || "");

    const coverElement: Element | null = meta.querySelector("[name='cover']");
    const coverId: string | undefined = coverElement?.getAttribute("content") ?? undefined;

    return { title, author, coverId };
}

const parseManifest = (manifest: Element): Map<string, string> => {
    const manifestItems: Map<string, string> = new Map();

    for (const item of manifest.children) {
        const id = item.getAttribute("id");
        const href = item.getAttribute("href");
        if (id && href) {
            manifestItems.set(id, relativeToAbsAndHash(href, opfLocation).path);
        }
    }

    return manifestItems;
}



const parseSpine = (spine: Element, manifestItems: Map<string, string>): string[] =>
    Array.from(spine.children).map(x => manifestItems.get(x.getAttribute("idref") ?? "") ?? "");


const getCoverFromFirstPage = (firstPageHTML: string, relativeTo: string): string => {
    // Fallback to taking image from first page if no cover from opf metadata.
    // Should only be used if no cover from opf metadata.
    const imageElement = domParser.parseFromString(firstPageHTML, "application/xhtml+xml").querySelector("img");
    if (imageElement && imageElement.hasAttribute("src")) {
        const path = imageElement.getAttribute("src");
        return path ? relativeToAbsAndHash(path, relativeTo).path : "";
    } else {
        return "";
    }
}

const relativeToAbsAndHash = (path: string, relativeTo: string) => {
    const url = new URL(path, `http://localhost/${relativeTo}`);
    return { path: url.pathname.slice(1), hash: url.hash };
}

const TocRecursive = (navPoint: Element, spine: string[]): TableOfContentsItem => {
    const title = navPoint.querySelector("text")?.textContent || "";

    const contentElement = navPoint.querySelector("content");
    const href = contentElement?.getAttribute("src");

    const { path, hash } = href ? relativeToAbsAndHash(href, ncxLocation) : { path: "", hash: "" };

    const index = spine.indexOf(path);

    const children = Array.from(navPoint.querySelectorAll("navPoint")).map(x => TocRecursive(x, spine));
    return { title, href: path + hash, index, children: children.length > 0 ? children : undefined };
}

const parseToc = (tocNcx: string, spine: string[]): TableOfContentsItem[] => {
    const TOC: TableOfContentsItem[] = [];
    const navMap = domParser.parseFromString(tocNcx, "application/xml").querySelector("navMap");
    if (navMap) {
        for (const navPoint of navMap.children) {
            TOC.push(TocRecursive(navPoint, spine));
        }
    }
    return TOC;
}

export const parseEpub = async (epub: File): Promise<{ meta: Metadata, book: Book }> => {
    // Perhaps want to extract here and then pass entries to function that gets toc and opf
    try {
        const { tocNcx, opf, entries } = await extract(epub)
        const { title, author, coverFile, spine } = parseOpf(opf);
        const toc: TableOfContentsItem[] = parseToc(tocNcx, spine);
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

        const meta: Metadata = { title, author, cover, progress: 0, length: spine.length - 1 };
        const book: Book = { spine, toc, file: epub };

        return { meta, book };

    } catch (e) {
        console.error(e);
        throw new Error(epub.name + " does not appear to be a valid EPUB file");
    }
}