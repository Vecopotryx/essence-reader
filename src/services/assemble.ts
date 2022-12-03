import type { Book } from "./types";

const updateCSS = (css: string, images, fonts) => {
    let newCss = css.replace(/url\((?!['"]?(?:data):)['"]?([^'"\)]*)['"]?\)/g, function (match, source) {
        const filename = source.split('\\').pop().split('/').pop();
        let imageTypes = [".png", ".jpg", ".jpeg", ".gif"];
        let fontTypes = [".otf", ".ttf", ".woff"];
        let array = [];

        if (imageTypes.some(s => filename.endsWith(s))) {
            array = images;
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

const replaceNumbersWithBlobs = (html: string, images: { name: string, blob: Blob }[]) => {
    return html.replace(/ESSENCE-READER-IMAGE-(\d*)/g, function(matched, index){
        return URL.createObjectURL(images[index].blob);
    })
}

export const openBookThing = (book: Book): Book => {
    for (let i = 0; i < book.contents.length; i++) {
        book.contents[i] = (replaceNumbersWithBlobs(book.contents[i], book.files.images));
    }

    let cssStuff: { name: string, css: string}[] = book.files.styles;

    for (let i = 0; i < cssStuff.length; i++) {
        cssStuff[i].css = updateCSS(cssStuff[i].css, book.files.images, book.files.fonts);
    }

    return {meta: book.meta, contents: book.contents, toc: book.toc, files: book.files, progress: book.progress}
}