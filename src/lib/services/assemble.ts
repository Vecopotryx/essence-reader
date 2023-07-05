import type { Book } from "./types";

const updateCSS = (css: string, images: Map<string, Blob>, fonts: Map<string, Blob>): string => {
    let newCss = css.replace(/url\((?!['"]?(?:data):)['"]?([^'"\)]*)['"]?\)/g, function (match, source) {
        const filename = source.split('\\').pop().split('/').pop();
        const imageTypes = [".png", ".jpg", ".jpeg", ".gif"];
        const fontTypes = [".otf", ".ttf", ".woff"];

        if (imageTypes.some(s => filename.endsWith(s)) && images.has(filename)) {
            return "url(" + URL.createObjectURL(images.get(filename)) + ")";
        } else if (fontTypes.some(s => filename.endsWith(s)) && fonts.has(filename)) {
            return "url(" + URL.createObjectURL(fonts.get(filename)) + ")";
        }
        return "" // Fallback
    });

    return newCss;
}

export const prepareBook = (book: Book): Book => {
    try {
        book.files.styles.forEach((css, key, self) => self.set(key, updateCSS(css, book.files.images, book.files.fonts)));
        return book;
    } catch {
        alert("An error occured when preparing book, please try removing it and adding it again");
    }
}