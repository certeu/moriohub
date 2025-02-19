/*
 * Various helper methods to handle file system access
 */
import fs from "fs";
import path from "path";
import { glob } from "glob";

/**
 * The morio root folder
 */
export const root = path.resolve(path.basename(import.meta.url), "..");

/**
 * Reads a folder from disk with an optional glob pattern
 *
 * @param {string} (relative) path to the file to read
 * @param {funtion} onError - a method to call on error
 *
 * @return {string} File contents, or false in case of trouble
 */
export async function globDir(
  folderPath = "/morio/downloads", // The (relative) path to the folder
  pattern = "**/*" // Glob pattern to match
) {
  let list = [];
  try {
    list = await glob(path.resolve(folderPath) + "/" + pattern);
  } catch (err) {
    if (err) console.log(err);
    return false;
  }

  return list;
}

/**
 * Reads a file from disk
 *
 * @param {string} (relative) path to the file to read
 * @param {funtion} onError - a method to call on error
 *
 * @return {string} File contents, or false in case of trouble
 */
export async function readFile(
  filePath, // The (relative) path to the file
  onError, // Method to run on error
  binary = false
) {
  let content, file;
  try {
    file = path.resolve(root, filePath);
    content = await fs.promises.readFile(file, binary ? undefined : "utf-8");
  } catch (err) {
    if (onError) onError(err);

    return false;
  }
  return content;
}

/**
 * Writes a file to disk
 *
 * @param {string} filePath - (relative) path to the file to write
 * @param {string} data - the data to write to disk
 * @param {function} log - a logger instance (or false)
 * @param {octal} mode - a mode for chmod
 *
 * @return {bool} true of success, false in case of trouble
 */
export async function writeFile(
  filePath, // The (relative) path to the file
  data, // The data to write to disk
  log = false,
  mode = 0o666
) {
  let file;
  try {
    file = path.resolve(root, filePath);
    await fs.promises.mkdir(path.dirname(file), { recursive: true });
    await fs.promises.writeFile(file, data);
    await fs.promises.chmod(file, mode);
  } catch (err) {
    if (log) log.warn(err, `Failed to write file: ${file}`);
    else console.log(`Failed to write file: ${file}`);

    return false;
  }

  return true;
}

/**
 * Writes a JSON file to disk
 *
 * @param {string} filePath - (relative) path to the file to write
 * @param {string} data - the data to write to disk as a Javascript object
 *
 * @return {bool} true of success, false in case of trouble
 */
export async function writeJsonFile(filePath, data, log, mode) {
  return await writeFile(filePath, JSON.stringify(data, null, 2), log, mode);
}
