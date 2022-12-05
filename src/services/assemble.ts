import type { Book } from "./types";

const updateCSS = (css: string, images, fonts) => {
    let newCss = css.replace(/url\((?!['"]?(?:data):)['"]?([^'"\)]*)['"]?\)/g, function (match, source) {
        const filename = source.split('\\').pop().split('/').pop();
        let imageTypes = [".png", ".jpg", ".jpeg", ".gif"];
        let fontTypes = [".otf", ".ttf", ".woff"];
        let array = [];

        if (imageTypes.some(s => filename.endsWith(s))) {
            return URL.createObjectURL(images.get(filename));
        } else if (fontTypes.some(s => filename.endsWith(s))) {
            array = fonts;
        }

        return "url(" + getBlobUrl(filename, array) + ")";
    });

    return newCss;
}

const getBlobUrl = (filename: string, array: { name: string, blob: Blob }[]) => {
    for (const { name, blob } of array) {
        if (name.includes(filename)) {
            return URL.createObjectURL(blob);
        }
    }

    return "";
}

const replaceNamesWithBlobs = (html: string, images: Map<string, Blob>) => {
    return html.replace(/ESSENCE-READER-IMAGE-([^?#"']*)/g, function (matched, filename) {
        return URL.createObjectURL(images.get(filename));
    })
}

export const openBookThing = (book: Book): Book => {
    for (let i = 0; i < book.contents.length; i++) {
        book.contents[i] = (replaceNamesWithBlobs(book.contents[i], book.files.images));
    }

    let cssStuff: Map<string, string> = book.files.styles;

    for (const [key, css] of cssStuff) {
        cssStuff.set(key, updateCSS(css, book.files.images, book.files.fonts));
    }

    return {meta: book.meta, contents: book.contents, toc: book.toc, files: book.files, progress: book.progress}
}