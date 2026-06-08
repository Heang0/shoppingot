import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROVINCES_URL = 'https://raw.githubusercontent.com/bsthen/CambodiaGeoAPI/main/data/CambodiaProvinceList2023.csv';
const DISTRICTS_URL = 'https://raw.githubusercontent.com/bsthen/CambodiaGeoAPI/main/data/CambodiaDistrictList2023.csv';
const COMMUNES_URL = 'https://raw.githubusercontent.com/bsthen/CambodiaGeoAPI/main/data/CambodiaCommuneList2023.csv';

const fetchCSV = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  const text = await res.text();
  
  const lines = text.split('\n').filter(line => line.trim() !== '');
  const headers = lines[0].split(',').map(h => h.trim());
  
  return lines.slice(1).map(line => {
    // Basic CSV parse (no quoted commas in this dataset based on visual inspection)
    const values = line.split(',');
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = values[i] ? values[i].trim() : '';
    });
    return obj;
  });
};

const run = async () => {
  try {
    console.log('Fetching Provinces...');
    const provinces = await fetchCSV(PROVINCES_URL);
    
    console.log('Fetching Districts...');
    const districts = await fetchCSV(DISTRICTS_URL);
    
    console.log('Fetching Communes...');
    const communes = await fetchCSV(COMMUNES_URL);

    console.log('Building JSON tree...');
    
    const tree = provinces.map(p => ({
      code: p.code,
      name_km: p.name_km,
      name_en: p.name_en,
      districts: districts
        .filter(d => d.province_code === p.code)
        .map(d => ({
          code: d.code,
          name_km: d.name_km,
          name_en: d.name_en,
          communes: communes
            .filter(c => c.district_code === d.code)
            .map(c => ({
              code: c.code,
              name_km: c.name_km,
              name_en: c.name_en
            }))
        }))
    }));

    const frontendDataDir = path.resolve(__dirname, '../../frontend/public/data');
    if (!fs.existsSync(frontendDataDir)) {
      fs.mkdirSync(frontendDataDir, { recursive: true });
    }

    const outputPath = path.join(frontendDataDir, 'cambodia_geo.json');
    fs.writeFileSync(outputPath, JSON.stringify(tree, null, 2));
    
    console.log(`✅ Successfully generated ${outputPath}`);
  } catch (err) {
    console.error('❌ Error generating Cambodia Geo JSON:', err);
  }
};

run();
