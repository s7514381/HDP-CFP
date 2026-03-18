interface FormatOptions {
  /** 是否顯示時間 (預設 false) */
  includeTime?: boolean;
  /** 年月日間隔符號 (預設 "-") */
  dateSep?: string;
  /** 時間間隔符號 (預設 ":") */
  timeSep?: string;
}

/**
 * 將資料庫原始日期字串格式化為可讀格式。
 * 支援格式：
 * 1. YYYYMMDD (例如: 20250503)
 * 2. YYYYMMDD-HHMMSS (例如: 20250503-143025)
 * @param {string | null | undefined} dateStr - 來自資料庫的原始日期字串
 * @param {FormatOptions} options - 格式化配置
 * @returns {string | null | undefined} 格式化後的結果。若輸入不符合預期格式，則回傳原值。
 * @example
 * // 基本用法 (回傳 YYYY-MM-DD)
 * dateTimeHelper.format("20250503"); // "2025-05-03"
 * @example
 * // 顯示時間 (回傳 YYYY-MM-DD HH:mm:ss)
 * dateTimeHelper.format("20250503-143025", { includeTime: true }); // "2025-05-03 14:30:25"
 * @example
 * // 自定義符號
 * dateTimeHelper.format("20250503", { dateSep: "/" }); // "2025/05/03"
 * @example
 * // 非法格式回傳原值
 * dateTimeHelper.format("InvalidData"); // "InvalidData"
 */
const format = (
  dateStr: string | null | undefined,
  options: FormatOptions = {}
): string | null | undefined => {
  // 1. 基本防呆
  if (!dateStr) return dateStr;

  const { 
    includeTime = false, 
    dateSep = "-", 
    timeSep = ":" 
  } = options;

  /**
   * 正則解析：
   * ^(\d{4})(\d{2})(\d{2}) : 匹配前 8 碼日期
   * (?:-(\d{2})(\d{2})(\d{2}))? : 可選匹配 "-" 後接 6 碼時間
   */
  const pattern = /^(\d{4})(\d{2})(\d{2})(?:-(\d{2})(\d{2})(\d{2}))?$/;
  const match = dateStr.match(pattern);

  // 2. 判斷是否符合格式，不符合則原值返回
  if (!match) return dateStr;

  // match 的結果：[全匹配, Y, M, D, h, m, s]
  // 注意：如果沒有時間部分，h, m, s 會是 undefined
  const [, Y, M, D, h, m, s] = match;

  // 3. 組合日期部分
  const formattedDate = `${Y}${dateSep}${M}${dateSep}${D}`;

  // 4. 判斷是否需要並可以組合時間部分
  if (includeTime && h !== undefined && m !== undefined && s !== undefined) {
    return `${formattedDate} ${h}${timeSep}${m}${timeSep}${s}`;
  }

  return formattedDate;
};

/**
 * 取得當前日期
 * @param dateSep 年月日間隔符號 (預設 "-", 回傳 YYYY-MM-DD)
 * @param timeZoneOffset 時區偏移小時 (預設 8, 台灣時區)
 */
const getNowDate = (dateSep: string = "-", timeZoneOffset: number = 8): string => {
  const now = new Date();
  // 計算時區偏移 (小時轉毫秒)
  const offsetMs = timeZoneOffset * 60 * 60 * 1000;
  // 加上本地時區與 UTC 的差距，轉換為目標時區時間
  const localTime = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + offsetMs);
  
  const Y = localTime.getFullYear();
  const M = String(localTime.getMonth() + 1).padStart(2, '0');
  const D = String(localTime.getDate()).padStart(2, '0');

  return `${Y}${dateSep}${M}${dateSep}${D}`;
};

/**
 * 取得當前完整時間戳記
 * @param timeZoneOffset 時區偏移小時 (預設 8, 台灣時區)
 * @param options 同 format 的配置 (dateSep, timeSep)
 */
const getNowTime = (timeZoneOffset: number = 8, options: FormatOptions = {}): string => {
  const { dateSep = "-", timeSep = ":", includeTime = true } = options;
  const now = new Date();
  const _timeZoneOffset = timeZoneOffset || 8; // 預設台灣
  const offsetMs = _timeZoneOffset * 60 * 60 * 1000;
  const localTime = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + offsetMs);

  const Y = localTime.getFullYear();
  const M = String(localTime.getMonth() + 1).padStart(2, '0');
  const D = String(localTime.getDate()).padStart(2, '0');
  
  const datePart = `${Y}${dateSep}${M}${dateSep}${D}`;
  
  if (!includeTime) return datePart;

  const h = String(localTime.getHours()).padStart(2, '0');
  const m = String(localTime.getMinutes()).padStart(2, '0');
  const s = String(localTime.getSeconds()).padStart(2, '0');

  // 如果沒有分隔符號，通常中間會加個 "-" 區隔日期與時間
  const connector = (dateSep === "" && timeSep === "") ? "-" : " ";
  return `${datePart}${connector}${h}${timeSep}${m}${timeSep}${s}`;
};

const dateTimeHelper = {
  format,
  getNowDate,
  getNowTime
};
export default dateTimeHelper;