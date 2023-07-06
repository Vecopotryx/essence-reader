import type { ZipInfo } from "unzipit";

export const applySettings = (settings: { scale: number, fontFamily: string }) => {
    let styleE = document.getElementById("user-settings");
    if (!styleE) {
        styleE = document.createElement("style");
        styleE.id = "user-settings";
        document.head.appendChild(styleE);
    }

    styleE.innerText =
        "#container { transform: scale(" +
        settings.scale / 10 +
        "); width: " +
        50 / (settings.scale / 10) +
        "%; }" +
        " @media (max-width: 1500px) {#container { width: " +
        90 / (settings.scale / 10) +
        "%}}" +
        (settings.fontFamily !== "Default"
            ? " #container p, #container a, #container span { font-family: " +
            settings.fontFamily +
            " !important;}"
            : "");
    localStorage.setItem("settings", JSON.stringify(settings));
};

export const updateStyles = (styles: Map<string, string>) => {
    // Doesn't adapt based on which section is loaded, but works for now
    for (const styleE of document.getElementsByClassName(
        "essence-reader"
    )) {
        styleE.remove();
    }

    styles.forEach((stylesheet) => {
        const styleE = document.createElement("style");
        styleE.innerText = stylesheet;
        styleE.className = "essence-reader";
        document.head.appendChild(styleE);
    });
};

  const relativeToAbs = (path: string, relativeTo: string) => {
    const basePath = "http://localhost/" + relativeTo;
    const resolvedPath = new URL(path, basePath).pathname.slice(1);
    return resolvedPath;
}

const domParser = new DOMParser();

export const assembleChapter = async(chapterPath: string, entries: ZipInfo["entries"], jumpToElementAndChapter: (href: string) => void): Promise<HTMLElement> => {
    const html = await entries[chapterPath].text();

    let newHTML = domParser.parseFromString(html, "application/xhtml+xml");

    const errorNode = newHTML.querySelector('parsererror');
    if (errorNode) {
        // Try parsing as HTML if error when parsing as XHTML.
        // Can solve issues with mismatched tags
        newHTML = domParser.parseFromString(html, "text/html");
    }

    for (const e of newHTML.querySelectorAll<HTMLElement>('[src],[href], image')) {
        switch (e.tagName) {
            case "IMG":
            case "img": {
                const filename = relativeToAbs(e.getAttribute("src"), chapterPath);
                entries[filename].blob().then((blob) => {
                    e.setAttribute("src", URL.createObjectURL(blob));
                    e.style.cssText += 'max-height: 100%; max-width: 100%; object-fit: scale-down;';
                });

   
                break;
            }

            case "IMAGE":
            case "image": {
                const href = e.getAttributeNS('http://www.w3.org/1999/xlink', 'href');
                const filename = relativeToAbs(href, chapterPath);
                entries[filename].blob().then((blob) => {
                    e.setAttributeNS('http://www.w3.org/1999/xlink', 'href', URL.createObjectURL(blob));
                });
                break;
            }

            default: {

                if (e.getAttribute("href") !== null) {
                    if (e.getAttribute("href").includes("http")) {
                        e.setAttribute("target", "_blank");
                    } else {
                        let href = e.getAttribute("href").split("\\").pop().split("/").pop();
                        e.addEventListener("click", (e) => {
                            e.preventDefault();
                            jumpToElementAndChapter(href);
                        });
                    }
                }

                if (e.getAttribute("src") !== null && !e.getAttribute("src").includes("http")) {
                    e.removeAttribute("src");
                }
                break;
            }
        }
    }

    return newHTML.body;
}