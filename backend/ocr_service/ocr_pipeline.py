import pytesseract
import cv2
from pdf2image import convert_from_path
import numpy as np

def extract_text_from_pdf(pdf_path):

    images = convert_from_path(pdf_path)

    full_text = ""

    for img in images:

        img = np.array(img)
        img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        img = cv2.threshold(img, 150, 255, cv2.THRESH_BINARY)[1]

        try:
            text = pytesseract.image_to_string(img, lang="fra")
        except:
            text = pytesseract.image_to_string(img)

        full_text += text + "\n"

    return full_text