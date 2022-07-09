export type Metadata = {
    title: string;
    author: string[];
    cover: any;
}

export type Book = {
    meta: Metadata,
    contents: string[],
    styles: { name: string, css: string }[]
}