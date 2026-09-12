"use client";

import { useEffect, useRef, useState } from "react";

import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

export default function QRScanner({ open, onScan, onClose }) {
  const scannerRef = useRef(null);
  const scannerRunningRef = useRef(false);
  const handledScanRef = useRef(false);
  const fileInputRef = useRef(null);

  const [mode, setMode] = useState("choice");
  const [cameraError, setCameraError] = useState(null);
  const [fileError, setFileError] = useState(null);
  const [scanningFile, setScanningFile] = useState(false);

  /*
   * Reset the scanner whenever the modal opens.
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    handledScanRef.current = false;

    setMode("choice");
    setCameraError(null);
    setFileError(null);
    setScanningFile(false);
  }, [open]);

  /*
   * Stop the camera when the component closes
   * or changes away from camera mode.
   */
  useEffect(() => {
    if (!open || mode !== "camera") {
      return;
    }

    let scanner = null;
    let cancelled = false;

    async function startScanner() {
      try {
        handledScanRef.current = false;
        scannerRunningRef.current = false;
        setCameraError(null);

        scanner = new Html5Qrcode("qr-scanner");

        scannerRef.current = scanner;

        await scanner.start(
          {
            facingMode: "environment",
          },
          {
            fps: 10,
            qrbox: {
              width: 250,
              height: 250,
            },
            formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          },
          async (decodedText) => {
            if (handledScanRef.current || cancelled) {
              return;
            }

            handledScanRef.current = true;

            if (scannerRunningRef.current) {
              scannerRunningRef.current = false;

              try {
                await scanner.stop();
              } catch (error) {
                console.error("Failed to stop QR scanner:", error);
              }
            }

            try {
              scanner.clear();
            } catch {
              // Scanner may already be cleared.
            }

            if (scannerRef.current === scanner) {
              scannerRef.current = null;
            }

            onScan(decodedText);
          },
          () => {
            // Ignore normal scan failures.
          },
        );

        /*
         * start() has completed successfully.
         */
        if (cancelled) {
          /*
           * The component changed mode or closed while the
           * scanner was initializing.
           */
          try {
            await scanner.stop();
          } catch {
            // Scanner may already be stopped.
          }

          try {
            scanner.clear();
          } catch {
            // Ignore cleanup errors.
          }

          if (scannerRef.current === scanner) {
            scannerRef.current = null;
          }

          return;
        }

        scannerRunningRef.current = true;
      } catch (error) {
        console.error("QR camera failed:", error);

        scannerRunningRef.current = false;

        /*
         * Don't show an error when the user simply navigated
         * away while the camera was initializing.
         */
        if (!cancelled) {
          setCameraError(
            "Unable to access the camera. Check your browser permissions.",
          );
        }

        try {
          scanner?.clear();
        } catch {
          // Ignore cleanup errors.
        }

        if (scannerRef.current === scanner) {
          scannerRef.current = null;
        }
      }
    }

    startScanner();

    return () => {
      cancelled = true;

      const activeScanner = scannerRef.current;

      if (!activeScanner) {
        return;
      }

      /*
       * Only call stop() after start() has successfully completed.
       */
      if (scannerRunningRef.current) {
        scannerRunningRef.current = false;

        activeScanner
          .stop()
          .catch(() => {})
          .finally(() => {
            try {
              activeScanner.clear();
            } catch {
              // Ignore cleanup errors.
            }

            if (scannerRef.current === activeScanner) {
              scannerRef.current = null;
            }
          });
      }
    };
  }, [open, mode, onScan]);

  /*
   * Scan an uploaded QR image.
   */
  async function handleFileChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setFileError(null);
    setScanningFile(true);

    try {
      const scanner = new Html5Qrcode("qr-file-scanner");

      const decodedText = await scanner.scanFile(file, false);

      try {
        scanner.clear();
      } catch {
        // Ignore cleanup errors.
      }

      onScan(decodedText);
    } catch (error) {
      console.error("QR file scan failed:", error);

      setFileError("No QR code could be found in this image.");
    } finally {
      setScanningFile(false);

      /*
       * Clear the input so selecting the same
       * image again triggers onChange.
       */
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function handleClose() {
    onClose();
  }

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* Header */}

        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Scan QR Code</h2>

            <p className="mt-1 text-sm text-gray-500">
              Scan using your camera or upload an image containing a QR code.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="shrink-0 rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close QR scanner"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Choice */}

        {mode === "choice" && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setMode("camera")}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700"
            >
              Use Camera
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("file");
                setFileError(null);
              }}
              className="w-full rounded-lg border px-4 py-3 font-medium transition hover:bg-gray-50"
            >
              Upload QR Image
            </button>

            {/* <button
                            type="button"
                            onClick={handleClose}
                            className="w-full rounded-lg border px-4 py-3 text-sm text-gray-600 transition hover:bg-gray-50"
                        >
                            Cancel
                        </button> */}
          </div>
        )}

        {/* Camera */}

        {mode === "camera" && (
          <div className="space-y-4">
            <div id="qr-scanner" className="overflow-hidden rounded-xl" />

            {cameraError && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {cameraError}
              </div>
            )}

            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setMode("choice")}
                className="w-full rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-gray-50 sm:w-40"
              >
                Back
              </button>
            </div>

            {/* <button
                type="button"
                onClick={handleClose}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium transition hover:bg-gray-200"
              >
                Cancel
              </button> */}
          </div>
        )}

        {/* File upload */}

        {mode === "file" && (
          <div className="space-y-4">
            <div id="qr-file-scanner" className="hidden" />

            <label
              htmlFor="qr-file-input"
              className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition hover:bg-gray-50"
            >
              <span className="font-medium">
                {scanningFile ? "Scanning image..." : "Choose QR image"}
              </span>

              <span className="mt-1 text-sm text-gray-500">
                PNG, JPG, or other image
              </span>
            </label>

            <input
              ref={fileInputRef}
              id="qr-file-input"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={scanningFile}
              className="hidden"
            />

            {fileError && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {fileError}
              </div>
            )}

            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setMode("choice")}
                disabled={scanningFile}
                className="w-full rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-gray-50 disabled:opacity-50 sm:w-40"
              >
                Back
              </button>
              {/* <button
                type="button"
                onClick={handleClose}
                disabled={scanningFile}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium transition hover:bg-gray-200 disabled:opacity-50"
              >
                Cancel
              </button> */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
