import { unzip } from 'unzipit';
import type { Metadata, Book, TableOfContentsItem } from '$lib/types';
import { relativeToAbs, removeHash } from '$lib/utils';
const domParser = new DOMParser();

const parseOpf = (opf: string, opfPath: string) => {
	const opfDocument = domParser.parseFromString(opf, 'text/xml');

	const metadata = opfDocument.querySelector('metadata');
	if (!metadata) throw new Error('Metadata element not found in OPF');
	const { title, author, coverId } = parseMeta(metadata);

	const manifestElement = opfDocument.querySelector('manifest');
	if (!manifestElement) throw new Error('Manifest element not found in OPF');
	const manifestItems = parseManifest(manifestElement, opfPath);

	const spineElement = opfDocument.querySelector('spine');
	if (!spineElement) throw new Error('Spine element not found in OPF');
	const spine = parseSpine(spineElement, manifestItems);

	let coverPath: string | undefined = undefined;
	if (coverId && manifestItems.has(coverId)) {
		// Found cover following EPUB 2 spec
		coverPath = manifestItems.get(coverId);
	} else {
		// Try to find cover following EPUB 3 spec
		const coverItem = manifestElement.querySelector(
			"item[properties='cover-image']"
		);
		const href = coverItem?.getAttribute('href');

		if (href) {
			coverPath = relativeToAbs(href, opfPath);
		}
	}

	const ncxPath = manifestItems.get('ncx');

	return { title, author, coverPath, spine, ncxPath };
};

const parseMeta = (
	meta: Element
): { title: string; author: string[]; coverId: string | undefined } => {
	const titleElement: Element | null = meta.querySelector('title');
	const title: string = titleElement?.textContent || '';

	const authorElements: NodeListOf<Element> = meta.querySelectorAll('creator');
	const author: string[] = Array.from(authorElements).map(
		(v: Element) => v.textContent || ''
	);

	const coverElement: Element | null = meta.querySelector("[name='cover']");
	const coverId: string | undefined =
		coverElement?.getAttribute('content') ?? undefined;

	return { title, author, coverId };
};

const parseManifest = (
	manifest: Element,
	opfPath: string
): Map<string, string> => {
	const manifestItems: Map<string, string> = new Map();

	for (const item of manifest.children) {
		if (item.getAttribute('media-type') === 'application/x-dtbncx+xml') {
			const href = item.getAttribute('href');
			if (href) {
				manifestItems.set('ncx', relativeToAbs(href, opfPath));
			}
			continue;
		}
		const id = item.getAttribute('id');
		const href = item.getAttribute('href');
		if (id && href) {
			manifestItems.set(id, relativeToAbs(href, opfPath));
		}
	}

	return manifestItems;
};

const parseSpine = (
	spine: Element,
	manifestItems: Map<string, string>
): string[] =>
	Array.from(spine.children).map(
		(x) => manifestItems.get(x.getAttribute('idref') ?? '') ?? ''
	);

const TocRecursive = (
	navPoint: Element,
	spine: string[],
	ncxPath: string
): TableOfContentsItem => {
	const title = navPoint.querySelector('text')?.textContent || '';

	const contentElement = navPoint.querySelector('content');
	const href = contentElement?.getAttribute('src');

	const relativePath = href ? relativeToAbs(href, ncxPath) : '';

	const index = spine.indexOf(removeHash(relativePath));

	const children = Array.from(navPoint.querySelectorAll('navPoint')).map((x) =>
		TocRecursive(x, spine, ncxPath)
	);
	return {
		title,
		href: relativePath,
		index,
		children: children.length > 0 ? children : undefined
	};
};

const parseToc = (
	ncx: string,
	ncxPath: string,
	spine: string[]
): TableOfContentsItem[] => {
	const TOC: TableOfContentsItem[] = [];
	const navMap = domParser
		.parseFromString(ncx, 'application/xml')
		.querySelector('navMap');
	if (navMap) {
		for (const navPoint of navMap.children) {
			TOC.push(TocRecursive(navPoint, spine, ncxPath));
		}
	}
	return TOC;
};

const parseContainer = (containerFileContent: string): string => {
	const containerDocument = domParser.parseFromString(
		containerFileContent,
		'text/xml'
	);

	const opfPath = containerDocument
		.querySelector('rootfile')
		?.getAttribute('full-path');

	if (!opfPath) throw new Error('OPF file not found in container.xml');

	return opfPath;
};

export const parseEpub = async (
	epub: File
): Promise<{ meta: Metadata; book: Book }> => {
	try {
		const { entries } = await unzip(epub);

		const container = await entries['META-INF/container.xml'].text();
		const opfPath = parseContainer(container);
		const opf = await entries[opfPath].text();

		const { title, author, coverPath, spine, ncxPath } = parseOpf(opf, opfPath);

		let toc: TableOfContentsItem[] = [];
		if (ncxPath) {
			// Allowing for books without a ncx file
			const ncx = await entries[ncxPath].text();
			toc = parseToc(ncx, ncxPath, spine);
		}

		let cover: Blob | undefined;
		try {
			if (coverPath) {
				cover = await entries[coverPath].blob();
			}
		} catch (e) {
			cover = undefined;
		}

		const meta: Metadata = {
			title,
			author,
			cover,
			progress: 0,
			length: spine.length - 1
		};
		const book: Book = { spine, toc, file: epub };

		return { meta, book };
	} catch (e) {
		console.error(e);
		if (e instanceof Error) {
			throw new Error(`Error parsing EPUB file - ${e.message}`);
		}
		throw new Error('Error parsing EPUB file');
	}
};
