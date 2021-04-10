const lineReader = require('line-reader');
const jsdom = require('jsdom');
const {JSDOM} = jsdom;
const fs = require('fs');

interface Sound {
  file: string;
  description: string;
  category: string;
}

const files: Sound[] = [];
let currentCategory = '';
let currentDescription = '';
let currentFile = '';

let divTagOpen = false;

lineReader.eachLine('./tools/cat.html', (line: string, last: boolean) => {
  line = line.trim();

  if (line.includes('class="tabcontent"')) {
    const jsdomCategorie = new JSDOM(line);
    currentCategory = jsdomCategorie.window.document.getElementsByClassName('tabcontent')[0].id;
  }

  if (divTagOpen) {
    if (line.includes('span')) {
      currentDescription = line.replace('<span>', '').replace('</span>', '');
    }

    if (line.includes('<a href')) {
      const end = line.substr(21).indexOf('"');
      currentFile = line.substr(21, end);
      files.push({
        category: currentCategory,
        description: currentDescription,
        file: currentFile
      });
    }
  }

  if (divTagOpen && line.includes('</div>')) {
    divTagOpen = false;
  }

  if (line.includes('div') && line.includes('playAudio')) {
    divTagOpen = true;
  }

  if (last) {
    const wrapper = {
      categories: files
    };
    fs.writeFile('../resources/categories.json', JSON.stringify(wrapper, null, 4), (err: NodeJS.ErrnoException | null) => {
      console.log('err', err);
    });
  }
});

