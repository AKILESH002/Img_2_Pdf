import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';

function App() {
  const [images, setImages] = useState([]);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [error, setError] = useState(null);

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);
    setImages(files);
    setError(null);
  };

  const createPDF = async () => {
    try {
      const pdfDoc = await PDFDocument.create();

      for (const image of images) {
        const imageData = await image.arrayBuffer();
        let imageObj;
        
        try {
          if (image.type === 'image/png') {
            imageObj = await pdfDoc.embedPng(imageData);
          } else if (image.type === 'image/jpeg') {
            imageObj = await pdfDoc.embedJpg(imageData);
          } else {
            throw new Error(`Unsupported file type: ${image.type}`);
          }
          
          const page = pdfDoc.addPage();
          const { width, height } = page.getSize();
          const { width: imgWidth, height: imgHeight } = imageObj.scale(0.5);

          page.drawImage(imageObj, {
            x: (width - imgWidth) / 2, 
            y: (height - imgHeight) / 2,
            width: imgWidth,
            height: imgHeight,
          });

        } catch (e) {
          setError(`Failed to process file ${image.name}: ${e.message}`);
        }
      }

      const pdfBytes = await pdfDoc.save();
      setPdfBlob(new Blob([pdfBytes], { type: 'application/pdf' }));
    } catch (e) {
      setError(`An error occurred: ${e.message}`);
    }
  };

  const downloadPDF = () => {
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'images.pdf';
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div style={styles.container}>
      <h1>Image to PDF Converter</h1>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageChange}
        style={styles.fileInput}
      />
      <button onClick={createPDF} style={styles.button}>
        Convert to PDF
      </button>
      {error && <p style={styles.error}>{error}</p>}
      {pdfBlob && (
        <button onClick={downloadPDF} style={styles.button}>
          Download PDF
        </button>
      )}
    </div>
  );
}

const styles = {
  container: {
    textAlign: 'center',
    padding: '20px',
  },
  fileInput: {
    margin: '10px',
  },
  button: {
    margin: '10px',
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  error: {
    color: 'red',
  },
};

export default App;
