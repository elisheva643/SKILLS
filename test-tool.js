const fs = require('fs');
const path = require('path');

async function runLocalToolsTest() {
  console.log('=== תחילת בדיקת סימולציה מקומית לכלי והקטלוג המורחב ===\n');

  // 1. סימולציה של קטלוג המיומנויות המורחב במערכת
  const mockCatalog = [
    {
      name: 'excel-expert',
      description: 'Expert in Excel automation, data parsing, formulas, and generating structured spreadsheet sheets.'
    },
    {
      name: 'qa-engineer',
      description: 'Expert in software testing, writing comprehensive test cases, and analyzing system edge cases.'
    },
    {
      name: 'css-wizard',
      description: 'Expert in frontend styling, layout corrections, responsiveness, and clean CSS separation.'
    }
  ];

  // 2. בניית התיאור הדינמי המשותף למודל
  let toolDescription = `Activates a specific skill from the available system catalog to guide your next actions.\n\n`;
  toolDescription += `Available skills catalog:\n`;
  mockCatalog.forEach(skill => {
    toolDescription += `- ${skill.name}: ${skill.description}\n`;
  });

  console.log('1. בדיקת תיאור הכלי הדינמי (הקטלוג המלא שיוצג למודל לבחירה):');
  console.log('--------------------------------------------------');
  console.log(toolDescription);
  console.log('--------------------------------------------------\n');

  // פונקציית עזר להדמיית פעולת הריצה וקריאת קובץ ה-Markdown
  function simulateToolRun(skillName) {
    console.log(`[סימולציה] המודל מבקש להפעיל את המיומנות: "${skillName}"...`);
    const skillFilePath = path.join(__dirname, 'skills', skillName, 'SKILL.md');

    if (fs.existsSync(skillFilePath)) {
      const content = fs.readFileSync(skillFilePath, 'utf8');
      console.log(`✅ תוצאה עבור "${skillName}" נטענה בהצלחה:`);
      console.log('--------------------------------------------------');
      console.log(content);
      console.log('--------------------------------------------------\n');
    } else {
      console.log(`❌ תוצאה: השגיאה הוחזרה למודל - קובץ SKILL.md לא נמצא בנתיב: ${skillFilePath}\n`);
    }
  }

  // 3. הרצת סימולציות עבור מיומנויות שונות מתוך המבחר
  console.log('2. מריץ בדיקות שליפה מהדיסק עבור המיומנויות החדשות:');
  console.log('==================================================\n');
  
  simulateToolRun('excel-expert');
  simulateToolRun('css-wizard');
  simulateToolRun('qa-engineer');
  simulateToolRun('fake-skill'); // בדיקת הגנה

  console.log('=== הבדיקה המורחבת הסתיימה בהצלחה! ===');
}

runLocalToolsTest();
