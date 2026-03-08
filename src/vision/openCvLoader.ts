export function loadOpenCV(): Promise<any> {
    return new Promise((resolve, reject) => {
        // If already loaded, resolve immediately.
        // 'cv' is the global object injected by opencv.js
        if (window.cv && typeof window.cv.Mat === 'function') {
            resolve(window.cv);
            return;
        }

        const scriptId = 'opencv-script';
        let script = document.getElementById(scriptId) as HTMLScriptElement;

        if (!script) {
            script = document.createElement('script');
            script.id = scriptId;
            // Using OpenCV 4.8.0, matching common support for cv.js
            script.src = 'https://docs.opencv.org/4.8.0/opencv.js';
            script.async = true;
            document.body.appendChild(script);
        }

        script.onload = () => {
            // OpenCV.js takes a moment to initialize after the script loads.
            // We must wait for cv.onRuntimeInitialized
            if (window.cv) {
                if (window.cv.getBuildInformation) {
                    resolve(window.cv);
                } else {
                    window.cv.onRuntimeInitialized = () => {
                        resolve(window.cv);
                    };
                }
            } else {
                reject(new Error("window.cv is not defined after script load"));
            }
        };

        script.onerror = () => {
            reject(new Error("Failed to load OpenCV script. Please check your connection."));
        };
    });
}

// Add global type declaration for window.cv
declare global {
    interface Window {
        cv: any;
    }
}
