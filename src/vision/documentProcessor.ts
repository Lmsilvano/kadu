/**
 * Finds the largest contour in the image that roughly shapes like a rectangle (document).
 * Returns an array of 4 points or null.
 */
export function detectDocumentCorners(cv: any, src: any): any[] | null {
    const gray = new cv.Mat();
    const blurred = new cv.Mat();
    const edges = new cv.Mat();

    // 1. Grayscale
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

    // 2. Blur to remove noise
    cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT);

    // 3. Edge detection
    cv.Canny(blurred, edges, 75, 200, 3, false);

    // 4. Find contours
    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();
    cv.findContours(edges, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROCH_SIMPLE);

    let largestArea = 0;
    let docContour = null;

    for (let i = 0; i < contours.size(); ++i) {
        const cnt = contours.get(i);
        const area = cv.contourArea(cnt);

        if (area > 10000) { // arbitrary min size to ignore small noise
            const peri = cv.arcLength(cnt, true);
            const approx = new cv.Mat();
            cv.approxPolyDP(cnt, approx, 0.02 * peri, true);

            if (approx.rows === 4 && area > largestArea) {
                largestArea = area;
                if (docContour) docContour.delete(); // Free previous max
                docContour = approx.clone(); // Keep local copy
            }
            approx.delete();
        }
    }

    // Cleanup temps
    gray.delete();
    blurred.delete();
    edges.delete();
    contours.delete();
    hierarchy.delete();

    if (docContour) {
        // Extract points
        const points = [];
        for (let i = 0; i < 4; i++) {
            points.push({
                x: docContour.data32S[i * 2],
                y: docContour.data32S[i * 2 + 1]
            });
        }
        docContour.delete();
        return orderPoints(points);
    }

    return null;
}

/**
 * Applies a perspective transform to flatten the document.
 */
export function applyPerspective(cv: any, src: any, corners: any[]) {
    const tl = corners[0];
    const tr = corners[1];
    const br = corners[2];
    const bl = corners[3];

    // Calculate width
    const widthA = Math.sqrt(Math.pow(br.x - bl.x, 2) + Math.pow(br.y - bl.y, 2));
    const widthB = Math.sqrt(Math.pow(tr.x - tl.x, 2) + Math.pow(tr.y - tl.y, 2));
    const maxWidth = Math.max(widthA, widthB);

    // Calculate height
    const heightA = Math.sqrt(Math.pow(tr.x - br.x, 2) + Math.pow(tr.y - br.y, 2));
    const heightB = Math.sqrt(Math.pow(tl.x - bl.x, 2) + Math.pow(tl.y - bl.y, 2));
    const maxHeight = Math.max(heightA, heightB);

    const dstCorners = [
        { x: 0, y: 0 },
        { x: maxWidth - 1, y: 0 },
        { x: maxWidth - 1, y: maxHeight - 1 },
        { x: 0, y: maxHeight - 1 }
    ];

    const srcMat = cv.matFromArray(4, 1, cv.CV_32FC2, [
        tl.x, tl.y, tr.x, tr.y, br.x, br.y, bl.x, bl.y
    ]);
    const dstMat = cv.matFromArray(4, 1, cv.CV_32FC2, [
        dstCorners[0].x, dstCorners[0].y,
        dstCorners[1].x, dstCorners[1].y,
        dstCorners[2].x, dstCorners[2].y,
        dstCorners[3].x, dstCorners[3].y
    ]);

    const transformMatrix = cv.getPerspectiveTransform(srcMat, dstMat);
    const warped = new cv.Mat();
    cv.warpPerspective(src, warped, transformMatrix, new cv.Size(maxWidth, maxHeight));

    srcMat.delete();
    dstMat.delete();
    transformMatrix.delete();

    return warped;
}

/**
 * Naive row slicing logic by dividing image into N chunks.
 * In a more advanced implementation, this would use morphological ops to find line segments.
 */
export function sliceRowsNaive(cv: any, warped: any, numRowsExpected: number = 20): any[] {
    const rowHeight = Math.floor(warped.rows / numRowsExpected);
    const slices = [];

    for (let i = 0; i < numRowsExpected; i++) {
        const y = i * rowHeight;
        // don't exceed boundaries
        if (y + rowHeight > warped.rows) break;

        const rect = new cv.Rect(0, y, warped.cols, rowHeight);
        const roi = warped.roi(rect);
        slices.push(roi); // Must be deleted by caller
    }

    return slices;
}

// Helper: Top-left, Top-right, Bottom-right, Bottom-left
function orderPoints(pts: any[]) {
    // sort by x first
    pts.sort((a, b) => a.x - b.x);

    const leftMost = [pts[0], pts[1]];
    const rightMost = [pts[2], pts[3]];

    leftMost.sort((a, b) => a.y - b.y);
    const tl = leftMost[0];
    const bl = leftMost[1];

    rightMost.sort((a, b) => a.y - b.y);
    const tr = rightMost[0];
    const br = rightMost[1];

    return [tl, tr, br, bl];
}
