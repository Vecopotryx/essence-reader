import { unzip, type ZipInfo } from "unzipit";
import type { Metadata, Book, TableOfContentsItem } from "$lib/types";
const domParser = new DOMParser();

const parseOpf = (opf: { text: string, href: string }): { title: string, author: string[], coverFile: string | undefined, spine: string[] } => {
    const parsed = domParser.parseFromString(opf.text, "text/xml");

    const metadata = parsed.querySelector("metadata");
    const { title, author, coverId } = metadata ? parseMeta(metadata) : { title: "", author: [], coverId: undefined };

    const manifestElement = parsed.querySelector("manifest");
    if (!manifestElement) throw new Error("Manifest element not found in OPF");

    const manifestItems = parseManifest(manifestElement, opf.href);

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
    opf: { text: string, href: string },
    ncx: { text: string, href: string },
    entries: ZipInfo["entries"]
}

const extract = async (file: File): Promise<extractInterface> => {
    const { entries } = await unzip(file);

    const opf = { text: "", href: "" };
    const ncx = { text: "", href: "" };

    for (const [href, entry] of Object.entries(entries)) {
        switch (href.substring(href.lastIndexOf("."))) {
            case ".opf":
                opf.text = await entry.text();
                opf.href = href;
                break;
            case ".ncx": {
                ncx.text = await entry.text();
                ncx.href = href;
                break;
            }
            default: break;
        }
    }

    return { opf, ncx, entries };
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

const parseManifest = (manifest: Element, opfHref: string): Map<string, string> => {
    const manifestItems: Map<string, string> = new Map();

    for (const item of manifest.children) {
        const id = item.getAttribute("id");
        const href = item.getAttribute("href");
        if (id && href) {
            manifestItems.set(id, relativeToAbs(href, opfHref).path);
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
        return path ? relativeToAbs(path, relativeTo).path : "";
    } else {
        return "";
    }
}

const relativeToAbs = (path: string, relativeTo: string) => {
    const url = new URL(path, `http://localhost/${relativeTo}`);
    return { path: url.pathname.slice(1), hash: url.hash };
}


const TocRecursive = (navPoint: Element, spine: string[], ncxHref: string): TableOfContentsItem => {
    const title = navPoint.querySelector("text")?.textContent || "";

    const contentElement = navPoint.querySelector("content");
    const href = contentElement?.getAttribute("src");

    const { path, hash } = href ? relativeToAbs(href, ncxHref) : { path: "", hash: "" };

    const index = spine.indexOf(path);

    const children = Array.from(navPoint.querySelectorAll("navPoint")).map(x => TocRecursive(x, spine, ncxHref));
    return { title, href: path + hash, index, children: children.length > 0 ? children : undefined };
}

const parseToc = (ncx: { text: string, href: string }, spine: string[]): TableOfContentsItem[] => {
    const TOC: TableOfContentsItem[] = [];
    const navMap = domParser.parseFromString(ncx.text, "application/xml").querySelector("navMap");
    if (navMap) {
        for (const navPoint of navMap.children) {
            TOC.push(TocRecursive(navPoint, spine, ncx.href));
        }
    }
    return TOC;
}

export const parseEpub = async (epub: File): Promise<{ meta: Metadata, book: Book }> => {
    // Perhaps want to extract here and then pass entries to function that gets toc and opf
    try {
        const { opf, ncx, entries } = await extract(epub)
        const { title, author, coverFile, spine } = parseOpf(opf);
        const toc: TableOfContentsItem[] = parseToc(ncx, spine);
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