import type { Extracted, Book } from "./types";

const cssNester = (css: string, nestWith: string) => {
    // Found on Stackoverflow and works great: https://stackoverflow.com/a/67517828
    let kframes = [];
    css = css.replace(/@(-moz-|-webkit-|-ms-)*keyframes\s(.*?){([0-9%a-zA-Z,\s.]*{(.*?)})*[\s\n]*}/g, x => kframes.push(x) && '__keyframes__');
    css = css.replace(/([^\r\n,{}]+)(,(?=[^}]*{)|\s*{)/g, x => x.trim()[0] === '@' ? x : x.replace(/(\s*)/, '$1' + nestWith + ' '));
    return css.replace(/__keyframes__/g, x => kframes.shift());
}

const updateCSS = (css: string, images, fonts) => {
    let newCss = css.replace(/url\((?!['"]?(?:data):)['"]?([^'"\)]*)['"]?\)/g, function (match, source) {
        const filename = removePath(source);
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

const removePath = (filename: string) => {
    return filename.split('\\').pop().split('/').pop();
}

const getBlobUrl = (filename: string, array: { name: string, blob: Blob }[]) => {
    for (const { name, blob } of array) {
        if (name.includes(filename)) {
            return URL.createObjectURL(blob);
        }
    }

    return "";
}

const getFileIndex = (filename: string, array: { name: string, blob: Blob }[]) => {
    for (const [i, { name }] of array.entries()) {
         if (name.includes(filename)) {
            return i
        }
    }
    
    return -1;
}

const getBlobUrlFromIndex = (index: number, array: { name: string, blob: Blob }[]) => {
    return URL.createObjectURL(array[index].blob);
}

const replaceNumbersWithBlobs = (html: string, images: { name: string, blob: Blob }[]) => {
    return html.replace(/ESSENCE-READER-IMAGE-(\d*)/g, function(matched, index){
        return getBlobUrlFromIndex(index,images)
    })
}

const parser = new DOMParser();

const updateHTML = (html: string, images: { name: string, blob: Blob }[]) => {
    const newHTML = parser.parseFromString(html, "application/xhtml+xml");

    for (const e of newHTML.querySelectorAll<HTMLElement>('[src],[href], image')) {
        switch (e.tagName) {
            case "img": {
                const filename = removePath(e.getAttribute("src"));
                e.setAttribute("src", "ESSENCE-READER-IMAGE-" + getFileIndex(filename, images));
                e.style.cssText += 'max-height: 100%; max-width: 100%; object-fit: scale-down;';
                break;
            }

            case "image": {
                const filename = removePath(e.getAttributeNS('http://www.w3.org/1999/xlink', 'href'));
                e.setAttributeNS('http://www.w3.org/1999/xlink', 'href', "ESSENCE-READER-IMAGE-" + getFileIndex(filename, images));
                break;
            }

            default: {
                if (e.getAttribute("href") !== null && !e.getAttribute("href").includes("http")) {
                    e.removeAttribute("href");
                } else if (e.getAttribute("src") !== null && !e.getAttribute("src").includes("http")) {
                    e.removeAttribute("src");
                }
                break;
            }
        }
    }

    return newHTML.body.innerHTML;
}

export const assembleBook = ({ sections, htmls, images, fonts, styles }: Extracted) => {
    let contents: string[] = [];
    for (let i = 0; i < sections.length; i++) {
        for (const { name, html } of htmls) {
            if (name.includes(sections[i].href)) {
                contents.push(updateHTML(html, images));
                break;
            }
        }
    }

    for (let i = 0; i < styles.length; i++) {
        styles[i].css = cssNester(styles[i].css, "#container");
    }
    
    return { contents, files: {images, fonts, styles} };
}


export const openBookThing = (book: Book) => {
    let chapters: string[] = []
    for (const content of book.contents) {
        chapters.push(replaceNumbersWithBlobs(content, book.files.images));
    }

    let cssStuff: { name: string, css: string}[] = book.files.styles;

    for (let i = 0; i < cssStuff.length; i++) {
        cssStuff[i].css = updateCSS(cssStuff[i].css, book.files.images, book.files.fonts);
    }

    let returnBook: Book = {meta: book.meta, contents: chapters, files: book.files}

    return returnBook
}