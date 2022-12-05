import type { Book } from "./types";

const updateCSS = (css: string, images: Map<string, Blob>, fonts: Map<string, Blob>) => {
    let newCss = css.replace(/url\((?!['"]?(?:data):)['"]?([^'"\)]*)['"]?\)/g, function (match, source) {
        const filename = source.split('\\').pop().split('/').pop();
        const imageTypes = [".png", ".jpg", ".jpeg", ".gif"];
        const fontTypes = [".otf", ".ttf", ".woff"];

        if (imageTypes.some(s => filename.endsWith(s))) {
            return "url(" + URL.createObjectURL(images.get(filename)) + ")";
        } else if (fontTypes.some(s => filename.endsWith(s))) {
            return "url(" + URL.createObjectURL(fonts.get(filename)) + ")";
        }
    });

    return newCss;
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

    return { meta: book.meta, contents: book.contents, toc: book.toc, files: book.files, progress: book.progress }
}