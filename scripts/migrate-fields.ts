import "dotenv/config";
import prisma from '../lib/db/prisma';

async function main() {
  const problems = await prisma.problem.findMany();
  for (const p of problems) {
    let cat = 'Programming';
    let diff = 'Easy';
    const catMatch = p.description.match(/\*\*Category:\*\*\s*(.*?)\s*\|/);
    if (catMatch) cat = catMatch[1].trim();
    const diffMatch = p.description.match(/\*\*Difficulty:\*\*\s*(.*?)\n/);
    if (diffMatch) diff = diffMatch[1].trim();
    
    // Replace the prepended metadata header if it exists
    const newDesc = p.description.replace(/\*\*Category:\*\*\s*.*?\s*\|\s*\*\*Difficulty:\*\*\s*.*?\n\n/, '');
    
    await prisma.problem.update({
      where: { id: p.id },
      data: { category: cat, difficulty: diff, description: newDesc }
    });
  }
  console.log('Migrated ' + problems.length + ' problems');
}

main().catch(console.error);
