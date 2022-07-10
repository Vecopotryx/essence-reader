export type Metadata = {
    title: string;
    author: string[];
    cover: Blob;
}

export type Book = {
    meta: Metadata,
    contents: string[],
    styles: { name: string, css: string }[]
}

export type Extracted = {
    sections: { id: string, href: string }[],
    htmls: { name: string, html: string }[],
    images: { name: string, blob: Blob }[],
    fonts: { name: string, blob: Blob }[],
    styles: { name: string, css: string }[]
}