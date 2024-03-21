import React, { useRef, useEffect, useState } from "react";
import { ChromePicker } from 'react-color';
import { dummyData } from "./constants";

function wrapText(context, text, x, y, lineHeight, fitWidth) {
  fitWidth = fitWidth || 0;
  const maxCharactersPerLine = 30;

  if (fitWidth <= 0) {
      context.fillText(text, x, y);
      return;
  }

  let words = text.split(" ");
  let line = "";
  words.forEach((word, index) => {
      const testLine = (index === 0 ? "" : line + " ") + word; // Remove leading space for the first word
      if (testLine.length > maxCharactersPerLine) {
          context.fillText(line, x, y);
          line = word;
          y += lineHeight;
      } else {
          line = testLine;
      }
  });

  context.fillText(line, x, y);
}

const App = () => {
  const canvasRef = useRef();
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [captionText, setCaptionText] = useState(dummyData.caption.text);
  const [ctaText, setCtaText] = useState(dummyData.cta.text)
  const [color, setColor] = useState('#000000'); // Initial color

  const handleChange = (selectedColor) => {
    setColor(selectedColor.hex);
  };

  const handleCaptionTextChange = (event) =>{
    const newText = event.target.value;
    if (newText.trim() === '') {
      // If the input value is empty, set the default value
      setCaptionText(dummyData.caption.text);
    } else {
      // Otherwise, update the caption text state
      setCaptionText(newText);
    }
  }

  const handleCTATextChange = (event) =>{
    const newText = event.target.value;
    if (newText.trim() === '') {
      // If the input value is empty, set the default value
      setCtaText(dummyData.cta.text);
    } else {
      // Otherwise, update the caption text state
      setCtaText(newText);
    }
  }

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const imageUrl = reader.result;
        setPreviewUrl(imageUrl); // Pass the uploaded image URL to the parent component
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerInputFile = () => {
    fileInputRef.current.click();
  };

  const correctionFactors = {
    height: 15,
    width: 115,
    y: 200,
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const mask = new Image();
    const designPattern = new Image();
    const stroke = new Image();

    mask.src = dummyData.urls.mask;
    designPattern.src = dummyData.urls.design_pattern;
    stroke.src = dummyData.urls.stroke;

    mask.onload = () => {
      // Set canvas size to match mask dimensions
      canvas.width = mask.width;
      canvas.height = mask.height;

      // Draw mask
      context.fillStyle = color;
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(mask, 0, 0);

      // Draw design pattern
      context.drawImage(designPattern, 0, 0, canvas.width, canvas.height);

      // Draw image scaled to fit mask dimensions
      if (previewUrl) {
        const image = new Image();
        image.src = previewUrl;

        image.onload = () => {
          const scaleFactor = Math.min(
            mask.width / image.width,
            mask.height / image.height
          );

          const scaledWidth =
            image.width * scaleFactor - correctionFactors.width;
          const scaledHeight =
            image.height * scaleFactor - correctionFactors.height;

          const x = (mask.width - scaledWidth) / 2;
          const y = (mask.height - scaledHeight) / 2 + correctionFactors.y;

          context.drawImage(image, x, y, scaledWidth, scaledHeight);

          // Draw CTA
        };
      }
      // Draw caption text
      // Draw caption text with text wrapping
      const { caption } = dummyData;
      context.font = `${caption.font_size}px Arial`;
      context.fillStyle = caption.text_color;
      context.textAlign = caption.alignment;
      context.textBaseline = "top";
      wrapText(context, captionText, caption.position.x, caption.position.y, 60, 800)


      const { cta } = dummyData;
      const ctaWidth = 270; // Width of the CTA background
      const ctaHeight = 100; // Height of the CTA background
      const ctaX = cta.position.x - ctaWidth / 2;
      const ctaY = cta.position.y - ctaHeight / 2;
      context.fillStyle = cta.background_color;
      context.fillRect(ctaX, ctaY, ctaWidth, ctaHeight);
      context.font = "35px Arial";
      context.fillStyle = cta.text_color;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(ctaText, cta.position.x, cta.position.y);
    };
  }, [previewUrl, captionText, ctaText, color]);

  return (
    <div className=" bg-slate-500 flex flex-col items-center justify-center w-full h-screen">
      <canvas
        className=" border-4 h-[500px] w-[500px]"
        ref={canvasRef}
      ></canvas>
      <input
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        ref={fileInputRef}
        onChange={handleImageChange}
      />

      <input type="text" onChange={(e)=>handleCaptionTextChange(e)} placeholder="Caption Text"/>
      <input type="text" onChange={(e)=>handleCTATextChange(e)} placeholder="CTA Text"/>
      <ChromePicker color={color} onChange={handleChange} />
      <button onClick={triggerInputFile}>Upload Image</button>
    </div>
  );
};

export default App;
