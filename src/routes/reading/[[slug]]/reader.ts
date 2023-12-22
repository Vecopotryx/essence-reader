import { relativeToAbs } from '$lib/utils';
import type { ZipInfo } from 'unzipit';

const injectStyles = (styles: string[]) => {
	// TODO: Keep track of stylesheets and only update if changed
	const fragment = document.createDocumentFragment();

	document.head
		.querySelectorAll('.essence-reader')
		.forEach((styleE) => styleE.remove());

	styles.forEach((stylesheet) => {
		const styleE = document.createElement('style');
		styleE.innerText = nestCSSSelectors(stylesheet);
		styleE.className = 'essence-reader';
		fragment.appendChild(styleE);
	});

	document.head.appendChild(fragment);
};

const nestCSSSelectors = (css: string): string =>
	css.replace(/([^\r\n,{}]+)(,(?=[^}]*{)|\s*{)/g, '#container $1$2');

const domParser = new DOMParser();

export const assembleChapter = async (
	chapterPath: string,
	entries: ZipInfo['entries'],
	jumpTo: (href: string) => void
): Promise<HTMLElement> => {
	const html = await entries[chapterPath].text();

	let newHTML = domParser.parseFromString(html, 'application/xhtml+xml');

	const errorNode = newHTML.querySelector('parsererror');
	if (errorNode) {
		// Try parsing as HTML if error when parsing as XHTML.
		// Can solve issues with mismatched tags
		newHTML = domParser.parseFromString(html, 'text/html');
	}

	const styles: string[] = [];
	for (const e of newHTML.head.querySelectorAll(
		'link[rel="stylesheet"], style'
	)) {
		if (e.tagName.toLowerCase() === 'link') {
			const href = e.getAttribute('href');
			if (!href) continue;
			const filename = relativeToAbs(href, chapterPath).path;
			styles.push(await entries[filename].text());
		} else {
			styles.push(e.innerHTML);
		}
	}

	injectStyles(styles);

	// Process all URLs in the chapter
	for (const e of newHTML.body.querySelectorAll('[src], svg image, a[href]')) {
		if (e.tagName.toLowerCase() === 'a') {
			const href = e.getAttribute('href');
			if (href && !href.includes('http')) {
				e.addEventListener('click', (event) => {
					event.preventDefault();
					const relativeToAbsResult = relativeToAbs(href, chapterPath);
					const absHref = relativeToAbsResult.path + relativeToAbsResult.hash;
					jumpTo(absHref); // Internal links within the book
				});
			} else {
				e.setAttribute('target', '_blank'); // External links open in a new tab
			}
			continue;
		}

		const attribute = e.tagName.toLowerCase() === 'img' ? 'src' : 'xlink:href';
		const url = e.getAttribute(attribute);

		if (url && !url.includes('http')) {
			const filename = relativeToAbs(url, chapterPath).path;
			const blob = await entries[filename].blob();
			e.setAttribute(attribute, URL.createObjectURL(blob));

			// Fixes some SVGs not playing nicely
			if (e.parentElement?.tagName.toLowerCase() === 'svg') {
				e.parentElement?.setAttribute('height', 'auto');
				e.parentElement?.setAttribute('width', 'auto');
			}
		}
	}

	return newHTML.body;
};
