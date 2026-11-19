// Zero-dependency Node backend: serves the site and handles /go/<key> redirects (with click logging).
const http = require("http"), fs = require("fs"), path = require("path");
const root = __dirname, PORT = process.env.PORT || 3000;
const types = {".html":"text/html; charset=utf-8",".css":"text/css",".js":"text/javascript",".jpg":"image/jpeg",".jpeg":"image/jpeg",".png":"image/png",".webp":"image/webp",".svg":"image/svg+xml",".ico":"image/x-icon"};
http.createServer((req, res) => {
  const u = new URL(req.url, "http://localhost");
  if (u.pathname.startsWith("/go/")) {
    const key = decodeURIComponent(u.pathname.slice(4));
    let links = {};
    try { links = JSON.parse(fs.readFileSync(path.join(root, "links.json"), "utf8")); } catch (e) {}
    if (links[key] && links[key].url) {
      fs.appendFile(path.join(root, "clicks.log"), new Date().toISOString() + "\t" + key + "\n", () => {});
      res.writeHead(302, { Location: links[key].url }); return res.end();
    }
    res.writeHead(404); return res.end("Unknown link");
  }
  let p = decodeURIComponent(u.pathname); if (p === "/") p = "/index.html";
  const file = path.join(root, path.normalize(p)), ext = path.extname(file).toLowerCase();
  if (!file.startsWith(root) || !types[ext] || path.basename(file) === "server.js") { res.writeHead(404); return res.end("Not found"); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end("Not found"); }
    res.writeHead(200, { "Content-Type": types[ext] }); res.end(data);
  });
}).listen(PORT, () => console.log("Portfolio running at http://localhost:" + PORT));
