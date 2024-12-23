const path = "./dist/index.d.ts";
const text = `/// <reference types="../server.d.ts" />
/// <reference types="../server-ui.d.ts" />
${await Bun.file(path).text()}`;
await Bun.write(path, text);
