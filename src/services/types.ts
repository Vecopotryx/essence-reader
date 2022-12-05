export type Book = {
    meta: Metadata,
    contents: string[],
    toc: TOC[],
    files: Files,
    progress: number
}

export type Metadata = {
    title: string;
    author: string[];
    cover: Blob;
}

export type TOC = {
    name: string,
    index: number,
    isChild: boolean,
}

export type Files = {
    images: Map<string, Blob>,
    fonts: Map<string, Blob>,
    styles: Map<string, string>,
}