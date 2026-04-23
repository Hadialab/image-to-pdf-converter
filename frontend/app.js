const imageInput = document.getElementById("imageInput");
const fileInfo = document.getElementById("fileInfo");
const fileList = document.getElementById("fileList");
const outputNameInput = document.getElementById("outputName");
const landscapeInput = document.getElementById("landscapeInput");
const convertBtn = document.getElementById("convertBtn");
const statusMessage = document.getElementById("statusMessage");

let selectedFiles = [];

imageInput.addEventListener("change", () => {
  const files = imageInput.files;

  if (!files || files.length === 0) {
    selectedFiles = [];
    fileInfo.textContent = "No images selected";
    fileList.innerHTML = "";
    return;
  }

  selectedFiles = Array.from(files);
  fileInfo.textContent = `${selectedFiles.length} image(s) selected`;
  fileList.innerHTML = "";

  selectedFiles.forEach((file, index) => {
    const div = document.createElement("div");
    div.className = "file-item";
    div.textContent = `${index + 1}. ${file.name}`;
    fileList.appendChild(div);
  });

  statusMessage.textContent = "";
});

convertBtn.addEventListener("click", async () => {
  if (selectedFiles.length === 0) {
    statusMessage.textContent = "Please choose at least one image.";
    return;
  }

  const outputName = normalizePdfFileName(outputNameInput.value.trim());
  const landscape = landscapeInput.checked;

  convertBtn.disabled = true;
  statusMessage.textContent = "Converting images to PDF...";

  try {
    const formData = new FormData();

    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });

    formData.append("output", outputName);
    formData.append("landscape", String(landscape));

    const response = await fetch("http://localhost:3000/convert-image-to-pdf", {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}.`;

      try {
        const errorData = await response.json();
        if (errorData?.error) {
          errorMessage = errorData.error;
        }
      } catch {
      }

      throw new Error(errorMessage);
    }

    const blob = await response.blob();
    downloadBlob(blob, outputName);

    statusMessage.textContent = "PDF converted and downloaded successfully.";
  } catch (error) {
    statusMessage.textContent =
      error instanceof Error ? error.message : "Something went wrong.";
  } finally {
    convertBtn.disabled = false;
  }
});

function normalizePdfFileName(fileName) {
  if (!fileName) {
    return "output.pdf";
  }

  return fileName.toLowerCase().endsWith(".pdf") ? fileName : `${fileName}.pdf`;
}

function downloadBlob(blob, fileName) {
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = blobUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(blobUrl);
}
