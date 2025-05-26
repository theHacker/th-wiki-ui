function createReplacingLinksExtension(allProjects) {
    return {
        async: true, // -> activate async mode, so we can call Mermaid which only works asynchronous
        useNewRenderer: true, // -> renderer gets token as object (with all/additional properties), instead of fixed parameters
        renderer: {
            text(token) {
                let text = token.text;
                let replaced = false;

                for (const project of allProjects) {
                    const regExp = new RegExp(project.prefix + "-(\\d+)", "g");

                    text = text.replaceAll(regExp, (match, issueNumber) => {
                        if (issueNumber < project.nextIssueNumber) { // ignore obvious invalid issueKeys, better would be to check each issue before replacing
                            const text = match;
                            const link = '/issues/' + match;

                            replaced = true;
                            return `<a href="${link}" class="issue-link">` +
                                `<span>${text}</span><i class="fas fa-square-up-right fa-sm"></i>` +
                                '</a>';
                        } else {
                            return match;
                        }
                    });
                }

                return replaced ? text : false; // if nothing was replaced, use the default renderer, that converts URL to links for example
            }
        }
    }
}

export default createReplacingLinksExtension;
