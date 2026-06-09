// scripts/cleanup_dummy_data.ts
import { db } from "../src/server/db";
import { licenses, licenseActivations, licenseDevices } from "../src/server/db/schema";
import * as readline from "readline";

/**
 * Deletes ALL data from the licensing related tables.
 * Use with caution – this will remove every license, activation and device entry.
 * Supports a `--dry` flag to preview deletions without executing them.
 */
async function cleanupAllData(dryRun = false) {
  const actions = [
    { name: "licenseDevices", exec: () => db.delete(licenseDevices) },
    { name: "licenseActivations", exec: () => db.delete(licenseActivations) },
    { name: "licenses", exec: () => db.delete(licenses) },
  ];

  for (const a of actions) {
    if (dryRun) {
      console.log(`[DRY RUN] Would delete all rows from ${a.name}`);
    } else {
      await a.exec();
      console.log(`✅ Deleted all rows from ${a.name}`);
    }
  }

  if (!dryRun) {
    console.log("✅ All licensing dummy data removed.");
  } else {
    console.log("[DRY RUN] No data was actually removed.");
  }
}

// Prompt the user for confirmation unless `--yes` flag is provided.
const args = process.argv.slice(2);
const dryRun = args.includes("--dry");
const autoYes = args.includes("--yes");

function askConfirmation() {
  return new Promise<boolean>((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question("⚠️  This will delete ALL licensing data. Continue? (y/N) ", (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === "y");
    });
  });
}

(async () => {
  if (autoYes) {
    await cleanupAllData(dryRun);
    return;
  }
  const confirmed = await askConfirmation();
  if (!confirmed) {
    console.log("🛑 Cleanup aborted by user.");
    process.exit(0);
  }
  await cleanupAllData(dryRun);
})().catch((err) => {
  console.error("❌ Cleanup failed:", err);
  process.exit(1);
});
