export type Book = {
    id?: number;
    meta: Metadata;
    contents: Map<string, { index: number, html: string }>;
    spine: string[];
    toc: TOCItem[];
    files: Files;
    progress: number;
}

export type Metadata = {
    title: string;
    author: string[];
    cover: Blob | undefined;
}

export type TOCItem = {
    name: string;
    index: number;
    isChild: boolean;
}

export type Files = {
    images: Map<string, Blob>;
    fonts: Map<string, Blob>;
    styles: Map<string, string>;
}