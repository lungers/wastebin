const addLineNumbers = (content: string) => {
    const lines = content.split(/\r\n|\r|\n/g);
    // if last line contains only carriage return remove it
    if (lines.length > 0 && lines[lines.length - 1].trim() === '') {
        lines.pop();
    }

    const modifiedLines: string[] = [];
    const numbers = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].length > 0 ? lines[i] : '<br>';
        const lineNumber = i + 1;

        modifiedLines.push(`<div id="LC${lineNumber}" class="line">`, line, `</div>`);

        numbers.push(
            `<tr id="L${lineNumber}" class="hl-r">`,
            `<td class="hljs-ln-numbers">`,
            `<a href="#L${lineNumber}" class="hljs-ln-n" data-line-number="${lineNumber}">${lineNumber}</a>`,
            `</td>`,
            `</tr>`,
        );
    }

    return {
        content: modifiedLines.join(''),
        lineNumbers: `<table class="hljs-ln">${numbers.join('')}</table>`,
    };
};

export default addLineNumbers;
