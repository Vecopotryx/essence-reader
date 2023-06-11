import { db } from "../db";

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


export const saveProgress = (currentId: number, progress: number) => {
    if (currentId !== -1) {
        db.books.update(currentId, {
            progress: progress,
        });
    }
};

export const updateLinks = (elems: NodeListOf<Element>, updateSection: (href: string) => void) => {
    for (const elem of elems) {
        if (elem.getAttribute("href").includes("http")) {
            elem.setAttribute("target", "_blank");
        } else {
            let href = elem.getAttribute("href").split("\\").pop().split("/").pop();
            elem.addEventListener("click", (e) => {
                e.preventDefault();
                updateSection(href);
            });
        }
    }
}