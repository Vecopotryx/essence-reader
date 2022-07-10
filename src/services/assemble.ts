import type { Extracted, Metadata } from "./types";

const cssNester = (css: string, nestWith: string) => {
    // Found on Stackoverflow and works great: https://stackoverflow.com/a/67517828
    let kframes = [];
    css = css.replace(/@(-moz-|-webkit-|-ms-)*keyframes\s(.*?){([0-9%a-zA-Z,\s.]*{(.*?)})*[\s\n]*}/g, x => kframes.push(x) && '__keyframes__');
    css = css.replace(/([^\r\n,{}]+)(,(?=[^}]*{)|\s*{)/g, x => x.trim()[0] === '@' ? x : x.replace(/(\s*)/, '$1' + nestWith + ' '));
    return css.replace(/__keyframes__/g, x => kframes.shift());
}

const updateCSS = (css: string, images, fonts) => {
    let newCss = cssNester(css, "#container");

    newCss = newCss.replace(/url\((?!['"]?(?:data):)['"]?([^'"\)]*)['"]?\)/g, function (match, source) {

        let filename = source.split('\\').pop().split('/').pop();
        let imageTypes = [".png", ".jpg", "jpeg", ".gif"];
        let fontTypes = [".otf", ".ttf", ".woff"];
        let array = [];

        if (imageTypes.some(s => filename.endsWith(s))) {
            array = images;
        } else if (fontTypes.some(s => filename.endsWith(s))) {
            array = fonts;
        }

        for (let { name, blob } of array) {
            if (name.includes(filename)) {
                return "url(" + URL.createObjectURL(blob) + ")";
            }
        }

        return "";
    });

    return newCss;
}


const parser = new DOMParser();
    
const updateHTML = (html: string, images: { name: string, blob: Blob }[]) => {
    let newHTML = parser.parseFromString(html, "text/html")

    for (let e of newHTML.querySelectorAll<HTMLElement>('[src],[href]')) {
        switch (e.tagName) {
            case "IMG": {
                let filename = e.getAttribute("src").split('\\').pop().split('/').pop();
                for (let i = 0; i < images.length; i++) {
                    if (images[i].name.includes(filename)) {
                        e.setAttribute("src", URL.createObjectURL(images[i].blob));
                        break;
                    }
                }
                e.style.cssText += 'max-height: 100%; max-width: 100%; object-fit: scale-down;';
                break;
            }

            default: {
                if (e.getAttribute("href") !== null && !e.getAttribute("href").includes("http")) {
                    e.removeAttribute("href");
                }
                if (e.getAttribute("src") !== null && !e.getAttribute("src").includes("http")) {
                    e.removeAttribute("src");
                }
                break;
            }
        }
    }

    for (let e of newHTML.getElementsByTagName("image")) {
        let filename = e.getAttributeNS('http://www.w3.org/1999/xlink', 'href').split('\\').pop().split('/').pop();
        for (let i = 0; i < images.length; i++) {
            if (images[i].name.includes(filename)) {
                e.setAttributeNS('http://www.w3.org/1999/xlink', 'href', URL.createObjectURL(images[i].blob));
                break;
            }
        }
    }

    return newHTML.body.innerHTML;
}

export const assembleBook = (meta: Metadata, { sections, htmls, images, fonts, styles }: Extracted) => {
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
        styles[i].css = updateCSS(styles[i].css, images, fonts);
    }

    return { meta, contents, styles };
}