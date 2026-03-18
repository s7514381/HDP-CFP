/**
 * 處理 Blob 下載並自動抓取檔名
 */
export const downloadFile = ({blob, defaultFileName}: {blob: Blob, defaultFileName: string}) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // 這裡可以根據後端 content-disposition 判斷檔名，或由前端指定
    link.setAttribute('download', defaultFileName); 
    
    document.body.appendChild(link);
    link.click();
    
    // 清理資源
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
};

export default downloadFile;