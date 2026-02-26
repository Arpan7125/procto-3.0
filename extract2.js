const fs = require('fs');
const PDFParser = require('pdf2json');

const pdfParser = new PDFParser(this, 1);

pdfParser.on('pdfParser_dataError', errData => console.error(errData.parserError));
pdfParser.on('pdfParser_dataReady', pdfData => {
    const rawContent = pdfParser.getRawTextContent();
    console.log(rawContent);
});

pdfParser.loadPDF('PROCTO - PRESENTATION 1.pdf');
