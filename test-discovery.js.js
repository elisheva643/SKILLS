const path = require('path');

// הגדרת תאימות מורחבת עבור TypeScript בריצה ישירה
require('ts-node').register({
  compilerOptions: {
    module: 'commonjs',
    esModuleInterop: true,
    allowSyntheticDefaultImports: true
  }
});

// ניתוב ישיר לקובץ ה-TS המקורי בתוך ה-src
const skillsPath = path.join(__dirname, 'src', 'main', 'services', 'skills.ts');

async function runTest() {
  try {
    console.log("=========================================");
    console.log("מריץ בדיקה ישירה על קובץ ה-TypeScript...");
    console.log("=========================================");

    // ייבוא פונקציית הטעינה
    const { loadSkills, SKILLS_ROOT } = require(skillsPath);

    console.log(`תיקיית היעד לסריקה: ${SKILLS_ROOT}`);
    
    // הפעלת פונקציית הסריקה ושמירת התוצאה המוחזרת ישירות ממנה
    const loadedSkills = await loadSkills();
    
    // הדפסת התוצאה שחזרה מהפונקציה
    console.log("\n[תוצאת הבדיקה] תוכן ה-Skills שהתגלו בפועל:");
    console.log(JSON.stringify(loadedSkills, null, 2));
    console.log("=========================================");

  } catch (err) {
    console.error("\n[שגיאה] לא ניתן להריץ את הבדיקה.");
    console.error("פרטי השגיאה:", err.message);
  }
}

runTest();
