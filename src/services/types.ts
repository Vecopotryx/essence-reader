export type Book = {
    meta: Metadata,
    contents: Map<string, { index: number, html: string }>,
    spine: string[],
    toc: TOC[],
    files: Files,
    progress: number
}

export type Metadata = {
    title: string;
    author: string[];
    cover: Blob | undefined;
}

export type TOC = {
    name: string,
    href: string,
    isChild: boolean,
}

export type Files = {
    images: Map<string, Blob>,
    fonts: Map<string, Blob>,
    styles: Map<string, string>,
}