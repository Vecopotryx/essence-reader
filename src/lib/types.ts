export type Book = {
    id?: number;
    meta: Metadata;
    spine: string[];
    toc: TOCItem[];
    progress: number;
    file: File;
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