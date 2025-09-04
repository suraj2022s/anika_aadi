const fs = require("fs");
const path = require("path");
const FILE = path.join("/tmp", "payments.jsonl");
function ensureFile(){ try{ if(!fs.existsSync(FILE)) fs.writeFileSync(FILE, ""); }catch{} }
function readAll(){
  ensureFile();
  const txt = fs.readFileSync(FILE, "utf-8");
  const lines = txt.trim() ? txt.trim().split("\n") : [];
  return lines.map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
}
function writeAll(items){
  ensureFile();
  fs.writeFileSync(FILE, items.map(i => JSON.stringify(i)).join("\n") + (items.length ? "\n" : ""));
}
exports.store = {
  put(r){ const a = readAll(); const i = a.findIndex(x=>x.orderId===r.orderId); if(i>=0) a[i]=r; else a.push(r); writeAll(a); return r; },
  get(id){ return readAll().find(i=>i.orderId===id) || null; },
  list(){ return readAll().sort((a,b)=>(b.createdAt||0)-(a.createdAt||0)); },
  updateStatus(id, s){ const a = readAll(); const i = a.findIndex(x=>x.orderId===id); if(i>=0){ a[i].status=s; writeAll(a); return a[i]; } return null; }
};
