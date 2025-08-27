import {escapeHtmlAttribute, escapeHtmlText, trimIndent} from "@/helper/string.js";

const apiUrl = () => window?.env?.API_URL || import.meta.env.VITE_API_URL;

// Marked extension ////////////////////////////////////////////////////////////////////////////////////////////////////

const imageExtension = (imageResolver) => ({
    renderer: {
        image({href, title, text}) {
            if (href.includes("/") && !href.startsWith("./")) {
                return false;
            }

            // local image from attachments

            let filename;
            if (href.startsWith("./")) {
                filename = href.substring(2);
            } else {
                filename = href;
            }
            filename = decodeURIComponent(filename);

            return imageResolver(filename, href, title, text);
        }
    }
});

// Factory methods for the imageResolver ///////////////////////////////////////////////////////////////////////////////

function createAttachmentsImageResolver(attachments) {
    return (filename, href, title, text) => {
        const attachment = attachments?.find(a => a.filename === filename);
        if (attachment) {
            const e = escapeHtmlAttribute;
            const src = `${apiUrl()}/attachments/${attachment.id}`;

            // No override from Markdown, take strings from the attachment
            if (!text && attachment.description) {
                text = attachment.description;
            }

            // No title? Then default to alt/description
            if (!title && text) {
                title = text;
            }

            // Include title attribute only if there is content
            let titleAttr = '';
            if (title) {
                titleAttr = ` title="${e(title)}"`;
            }

            return `<img src="${src}" alt="${e(text)}"${titleAttr} />`;
        } else {
            const e = escapeHtmlText;

            return trimIndent`
                <div class="card bg-danger-subtle text-danger-emphasis mb-4">
                    <div class="card-header">
                        <i class="fas fa-bug pe-1"></i>
                        Attachment not found
                    </div>
                    <p class="card-body bg-transparent mb-0">There is no attachment with filename <code>${e(filename)}</code>.</p>
                </div>
            `;
        }
    };
}

function createBlobImageResolver(currentPath, attachments) {
    return (filename, href, title, text) => {
        // Note: We do NOT support all relative paths, e.g. ".."
        const attachmentPath = currentPath.replace(/(.*\/).+?$/, '$1') + filename;

        const attachment = attachments?.find(a => a.path === attachmentPath);
        if (!attachment) {
            const e = escapeHtmlText;

            console.warn(`There is no image with path: ${attachmentPath}. currentPath = ${currentPath}, filename = ${filename}`);

            return trimIndent`
                <div class="card bg-danger-subtle text-danger-emphasis mb-4">
                    <div class="card-header">
                        <i class="fas fa-bug pe-1"></i>
                        Image not found
                    </div>
                    <p class="card-body bg-transparent mb-0">
                        There is no image with path: <code>${e(attachmentPath)}</code>.<br />
                        <code>currentPath = "${e(currentPath)}"</code>, <code>filename = "${e(filename)}"</code>
                    </p>
                </div>
            `;
        }

        const e = escapeHtmlAttribute;

        if (!title && text) {
            title = text;
        }

        let titleAttr = '';
        if (title) {
            titleAttr = ` title="${e(title)}"`;
        }

        return `<img src="${attachment.url}" alt="${e(text)}"${titleAttr} />`;
    };
}

export {imageExtension, createAttachmentsImageResolver, createBlobImageResolver};
