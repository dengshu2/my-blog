// 抓取脚本共用的数据文件读写与失败处理。
// - 只有内容（不含 updatedAt）真的变化时才写文件，避免每天产生只改时间戳的提交
// - 失败时保留现有数据；在 GitHub Actions 里以非零退出并输出错误注解，让任务变红、触发邮件提醒
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const inCI = process.env.GITHUB_ACTIONS === "true";

export function readExisting(file) {
	if (!existsSync(file)) return null;
	try {
		return JSON.parse(readFileSync(file, "utf8"));
	} catch {
		return null;
	}
}

const withoutTimestamp = ({ updatedAt: _ignored, ...rest } = {}) => JSON.stringify(rest);

/** data 不含 updatedAt；内容未变时跳过写入，保留上次的 updatedAt。返回是否写入。 */
export function writeIfChanged(file, data) {
	const prev = readExisting(file);
	if (prev && withoutTimestamp(prev) === withoutTimestamp(data)) return false;
	writeFileSync(
		file,
		`${JSON.stringify({ updatedAt: new Date().toISOString(), ...data }, null, "\t")}\n`,
	);
	return true;
}

/** 输出 Actions 错误注解（本地运行时只是普通 stderr）。 */
export function reportError(tag, message) {
	console.error(inCI ? `::error title=${tag}::${message}` : `[${tag}] ${message}`);
}

/**
 * 失败收尾：保留现有数据（没有时写入 emptyData），然后退出。
 * CI 中以 1 退出让任务失败；本地（如缺少 token）以 0 退出，不打断开发。
 */
export function failKeepingExisting(tag, file, emptyData, reason) {
	if (existsSync(file)) {
		console.warn(`[${tag}] ${reason} —— 保留现有数据文件`);
	} else {
		console.warn(`[${tag}] ${reason} —— 无现有数据，写入空文件`);
		writeFileSync(file, `${JSON.stringify({ updatedAt: null, ...emptyData }, null, "\t")}\n`);
	}
	if (inCI) reportError(tag, reason);
	process.exit(inCI ? 1 : 0);
}
