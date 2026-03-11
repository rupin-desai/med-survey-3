import { readFile } from "fs/promises";
import { writeFileSync, mkdirSync } from "fs";
import { read, utils } from "xlsx";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// Read Excel file - adjust the filename to match your Excel file
const buf = await readFile(join(root, "Ortho List Maxter.xlsx"));
const wb = read(buf);
const ws = wb.Sheets[wb.SheetNames[0]];
const rows = utils.sheet_to_json(ws);

// Log the first row to see the column names
console.log("Sample row:", rows[0]);
console.log("Available columns:", Object.keys(rows[0] || {}));

// Group by city - adjust column names based on your Excel structure
const grouped = {};
for (const row of rows) {
  // Try different possible column names for CITY
  const city = (row["CITY"] || row["City"] || row["city"] || "").toString().trim().toUpperCase();
  if (!city) continue;
  if (!grouped[city]) grouped[city] = [];

  // Try different possible column names for Doctor Name and UIN
  const name = (row["Doctor Name"] || row["DOCTOR NAME"] || row["Name"] || row["NAME"] || "").toString().trim();
  const uin = (row["UIN Number"] || row["UIN NUMBER"] || row["UIN"] || row["uin"] || "").toString().trim();

  if (name) {
    grouped[city].push({ name, uin });
  }
}

// Sort cities alphabetically, sort doctors within each city by name
const sorted = {};
for (const city of Object.keys(grouped).sort()) {
  sorted[city] = grouped[city].sort((a, b) => a.name.localeCompare(b.name));
}

// Write output
const outDir = join(root, "data");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "doctors.json"), JSON.stringify(sorted, null, 2));

const totalDoctors = Object.values(sorted).reduce((sum, arr) => sum + arr.length, 0);
console.log(
  `✅ Extracted ${totalDoctors} doctors across ${Object.keys(sorted).length} cities → data/doctors.json`
);
