const path = "./dist/index.d.mts";
const text = `/// <reference types="../server.d.mts" />
/// <reference types="../server-ui.d.mts" />
${await Bun.file(path).text()}`;
await Bun.write(path, text);
