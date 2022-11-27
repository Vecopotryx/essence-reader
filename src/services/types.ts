export type Book = {
    meta: Metadata,
    contents: string[],
    files: Files
}

export type Metadata = {
    title: string;
    author: string[];
    cover: Blob;
}

export type Files = {
    images: { name: string, blob: Blob }[],
    fonts: { name: string, blob: Blob }[],
    styles: { name: string, css: string }[]
}