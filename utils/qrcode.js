import qrcode from 'qrcode-generator';

export function generateQRData(text, level) {
    var typeNumber = 0;
    var eccLevel = 'M';
    if (level === 1) eccLevel = 'L';
    else if (level === 0) eccLevel = 'M';
    else if (level === 3) eccLevel = 'Q';
    else if (level === 2) eccLevel = 'H';
    var qr = qrcode(typeNumber, eccLevel);
    qr.addData(text);
    qr.make();
    var size = qr.getModuleCount();
    var modules = [];
    for (var row = 0; row < size; row++) {
        modules[row] = [];
        for (var col = 0; col < size; col++) {
            modules[row][col] = qr.isDark(row, col);
        }
    }
    return { size: size, modules: modules };
}

export function drawQRCode(canvasId, text, options) {
    options = options || {};
    var colorDark = options.colorDark || '#000000';
    var colorLight = options.colorLight || '#ffffff';
    var margin = options.margin != null ? options.margin : 10;
    var level = options.level || 0;
    var eccLevel = 'M';
    if (level === 1) eccLevel = 'L';
    else if (level === 0) eccLevel = 'M';
    else if (level === 3) eccLevel = 'Q';
    else if (level === 2) eccLevel = 'H';
    var typeNumber = 0;
    var qr = qrcode(typeNumber, eccLevel);
    qr.addData(text);
    qr.make();
    var qrSize = qr.getModuleCount();
    var moduleCount = qrSize + margin * 2;
    var canvasSize = options.size || 200;
    var cellSize = canvasSize / moduleCount;

    const query = uni.createSelectorQuery();
    query.select('#' + canvasId)
        .fields({ node: true, size: true })
        .exec((res) => {
            if (!res || !res[0]) return;
            const canvas = res[0].node;
            const ctx = canvas.getContext('2d');
            const dpr = uni.getSystemInfoSync().pixelRatio;
            canvas.width = canvasSize * dpr;
            canvas.height = canvasSize * dpr;
            ctx.scale(dpr, dpr);

            ctx.fillStyle = colorLight;
            ctx.fillRect(0, 0, canvasSize, canvasSize);

            for (var row = 0; row < qrSize; row++) {
                for (var col = 0; col < qrSize; col++) {
                    if (qr.isDark(row, col)) {
                        var x = (col + margin) * cellSize;
                        var y = (row + margin) * cellSize;
                        ctx.fillStyle = colorDark;
                        ctx.fillRect(x, y, cellSize + 0.5, cellSize + 0.5);
                    }
                }
            }
        });
}