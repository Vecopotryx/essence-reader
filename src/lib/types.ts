export type Book = {
    id?: number;
    spine: string[];
    toc: TOCItem[];
    file: File;
}

export type Metadata = {
    id?: number;
    title: string;
    author: string[];
    cover: Blob | undefined;
    progress: number;
    length: number;
}

export type TOCItem = {
    name: string;
    index: number;
    href: string;
    isChild: boolean;
}