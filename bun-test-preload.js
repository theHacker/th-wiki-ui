const { JSDOM } = require("jsdom");

const dom = new JSDOM(`<!DOCTYPE HTML><html lang="en"><body></body></html>`);

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
