// modified version of https://gist.github.com/artemkrynkin/e6bf05d0f61ca3b2ed7e51291ad3a0bf

import qrcode from 'qrcode';

enum DefValues {
    rect = 'A',
    empty = 'B',
    b = 'C',
    r = 'D',
    l = 'E',
    t = 'F',
    lt = 'G',
    lb = 'H',
    rb = 'I',
    rt = 'J',
    n_lt = 'K',
    n_lb = 'L',
    n_rt = 'M',
    n_rb = 'N',
    point = 'O',
}

const qrModulesDataRender = (
    data: Uint8Array,
    size: number,
    moduleSize: number,
) => {
    let svg = '';
    const usedDefs = new Set<DefValues>();

    for (let i = 0; i < data.length; i++) {
        const col = Math.floor(i % size);
        const prevCol = col - 1;
        const nextCol = col + 1;
        const row = Math.floor(i / size);

        const currentValue = data[i];
        const prevValue = col && Boolean(data[i - 1]);
        const nextValue = nextCol !== size && Boolean(data[i + 1]);
        const prevValueTRow = Boolean(data[i - size]);
        const nextValueBRow = Boolean(data[i + size]);
        const prevValueTRowPrevCol = Boolean(data[i - 1 - size]);
        const nextValueBRowPrevCol = Boolean(data[i - 1 + size]);
        const prevValueTRowNextCol = Boolean(data[i + 1 - size]);
        const nextValueBRowNextCol = Boolean(data[i + 1 + size]);

        let moduleStyle: DefValues | null = null;

        if (currentValue) {
            if (col && !prevValue && nextValueBRow && nextValueBRowPrevCol) {
                moduleStyle = DefValues.n_rb;

                svg += `<g transform="translate(${prevCol * moduleSize},${
                    row * moduleSize
                })"><use xlink:href="#${moduleStyle}"/></g>`;
            }

            if (col && !prevValue && prevValueTRow && prevValueTRowPrevCol) {
                moduleStyle = DefValues.n_rt;

                svg += `<g transform="translate(${prevCol * moduleSize},${
                    row * moduleSize
                })"><use xlink:href="#${moduleStyle}"/></g>`;
            }

            if (
                nextCol !== size &&
                !nextValue &&
                nextValueBRow &&
                nextValueBRowNextCol
            ) {
                moduleStyle = DefValues.n_lb;

                svg += `<g transform="translate(${nextCol * moduleSize},${
                    row * moduleSize
                })"><use xlink:href="#${moduleStyle}"/></g>`;
            }

            if (
                nextCol !== size &&
                !nextValue &&
                prevValueTRow &&
                prevValueTRowNextCol
            ) {
                moduleStyle = DefValues.n_lt;

                svg += `<g transform="translate(${nextCol * moduleSize},${
                    row * moduleSize
                })"><use xlink:href="#${moduleStyle}"/></g>`;
            }

            if (moduleStyle) {
                usedDefs.add(moduleStyle);
            }

            if (!prevValue && nextValue && prevValueTRow && !nextValueBRow) {
                moduleStyle = DefValues.rt;
            } else if (
                !prevValue &&
                nextValue &&
                !prevValueTRow &&
                nextValueBRow
            ) {
                moduleStyle = DefValues.rb;
            } else if (
                prevValue &&
                !nextValue &&
                !prevValueTRow &&
                nextValueBRow
            ) {
                moduleStyle = DefValues.lb;
            } else if (
                prevValue &&
                !nextValue &&
                prevValueTRow &&
                !nextValueBRow
            ) {
                moduleStyle = DefValues.lt;
            } else if (
                !prevValue &&
                !nextValue &&
                prevValueTRow &&
                !nextValueBRow
            ) {
                moduleStyle = DefValues.t;
            } else if (
                prevValue &&
                !nextValue &&
                !prevValueTRow &&
                !nextValueBRow
            ) {
                moduleStyle = DefValues.l;
            } else if (
                !prevValue &&
                nextValue &&
                !prevValueTRow &&
                !nextValueBRow
            ) {
                moduleStyle = DefValues.r;
            } else if (
                !prevValue &&
                !nextValue &&
                !prevValueTRow &&
                nextValueBRow
            ) {
                moduleStyle = DefValues.b;
            } else if (
                !prevValue &&
                !nextValue &&
                !prevValueTRow &&
                !nextValueBRow
            ) {
                moduleStyle = DefValues.empty;
            } else {
                moduleStyle = DefValues.rect;
            }

            svg += `<g transform=translate(${col * moduleSize},${
                row * moduleSize
            })><use xlink:href="#${moduleStyle}"/></g>`;

            if (moduleStyle) {
                usedDefs.add(moduleStyle);
            }
        }
    }

    return { svg, usedDefs };
};

const removeModules = (matrix: qrcode.BitMatrix) => {
    let size = matrix.size;

    let pos = [
        // top-left
        [0, 0],
        // top-right
        [size - 7, 0],
        // center
        [0, 0],
        // bottom-left
        [0, size - 7],
    ];

    for (let i = 0; i < pos.length; i++) {
        let row = pos[i][0];
        let col = pos[i][1];

        for (let r = -1; r <= 7; r++) {
            if (row + r <= -1 || size <= row + r) continue;

            for (let c = -1; c <= 7; c++) {
                if (col + c <= -1 || size <= col + c) continue;

                matrix.set(row + r, col + c, 0, true);
            }
        }
    }
};

const render = (qrData: qrcode.QRCode) => {
    removeModules(qrData.modules);

    const color = '#2B3544';
    const moduleSize = 97;
    const { data, size } = qrData.modules;
    const { svg, usedDefs } = qrModulesDataRender(data, size, moduleSize);

    return `<svg viewBox="0 0 ${moduleSize * size} ${
        moduleSize * size
    }" xmlns="http://www.w3.org/2000/svg"><defs>${
        usedDefs.has(DefValues.rect)
            ? `<path id=${DefValues.rect} fill="${color}" d="M0 0h100v100H0z"/>`
            : ''
    }${
        usedDefs.has(DefValues.empty)
            ? `<path id=${DefValues.empty} d="M0,28.6v42.9C0,87.3,12.8,100,28.6,100h42.9c15.9,0,28.6-12.8,28.6-28.6V28.6C100,12.7,87.2,0,71.4,0H28.6 C12.8,0,0,12.8,0,28.6z" fill="${color}"/>`
            : ''
    }${
        usedDefs.has(DefValues.b)
            ? `<path id=${DefValues.b} d="M0,0 L66,0 C84.7776815,-3.44940413e-15 100,15.2223185 100,34 L100,66 C100,84.7776815 84.7776815,100 66,100 L0,100 L0,0 Z" transform="rotate(-90 50 50)" fill="${color}"/>`
            : ''
    }${
        usedDefs.has(DefValues.r)
            ? `<path id=${DefValues.r} d="M0,0 L66,0 C84.7776815,-3.44940413e-15 100,15.2223185 100,34 L100,66 C100,84.7776815 84.7776815,100 66,100 L0,100 L0,0 Z" transform="rotate(-180 50 50)" fill="${color}"/>`
            : ''
    }${
        usedDefs.has(DefValues.l)
            ? `<path id=${DefValues.l} d="M0,0 L66,0 C84.7776815,-3.44940413e-15 100,15.2223185 100,34 L100,66 C100,84.7776815 84.7776815,100 66,100 L0,100 L0,0 Z" fill="${color}"/>`
            : ''
    }${
        usedDefs.has(DefValues.t)
            ? `<path id=${DefValues.t} d="M0,0 L66,0 C84.7776815,-3.44940413e-15 100,15.2223185 100,34 L100,66 C100,84.7776815 84.7776815,100 66,100 L0,100 L0,0 Z" transform="rotate(90 50 50)" fill="${color}"/>`
            : ''
    }${
        usedDefs.has(DefValues.lt)
            ? `<path id=${DefValues.lt} d="M0,0 L100,0 L100,66 C100,84.7776815 84.7776815,100 66,100 L0,100 L0,0 Z" fill="${color}"/>`
            : ''
    }${
        usedDefs.has(DefValues.lb)
            ? `<path id=${DefValues.lb} d="M0,0 L100,0 L100,66 C100,84.7776815 84.7776815,100 66,100 L0,100 L0,0 Z" transform="rotate(-90 50 50)" fill="${color}"/>`
            : ''
    }${
        usedDefs.has(DefValues.rb)
            ? `<path id=${DefValues.rb} d="M0,0 L100,0 L100,66 C100,84.7776815 84.7776815,100 66,100 L0,100 L0,0 Z" transform="rotate(-180 50 50)" fill="${color}"/>`
            : ''
    }${
        usedDefs.has(DefValues.rt)
            ? `<path id=${DefValues.rt} d="M0,0 L100,0 L100,66 C100,84.7776815 84.7776815,100 66,100 L0,100 L0,0 Z" transform="rotate(90 50 50)" fill="${color}"/>`
            : ''
    }${
        usedDefs.has(DefValues.n_lt)
            ? `<path id=${DefValues.n_lt} d="M30.5,2V0H0v30.5h2C2,14.7,14.8,2,30.5,2z" fill="${color}"/>`
            : ''
    }${
        usedDefs.has(DefValues.n_lb)
            ? `<path id=${DefValues.n_lb} d="M2,69.5H0V100h30.5v-2C14.7,98,2,85.2,2,69.5z" fill="${color}"/>`
            : ''
    }${
        usedDefs.has(DefValues.n_rt)
            ? `<path id=${DefValues.n_rt} d="M98,30.5h2V0H69.5v2C85.3,2,98,14.8,98,30.5z" fill="${color}"/>`
            : ''
    }${
        usedDefs.has(DefValues.n_rb)
            ? `<path id=${DefValues.n_rb} d="M69.5,98v2H100V69.5h-2C98,85.3,85.2,98,69.5,98z" fill="${color}"/>`
            : ''
    }<path id="${
        DefValues.point
    }" d="M600.001786,457.329333 L600.001786,242.658167 C600.001786,147.372368 587.039517,124.122784 581.464617,118.535383 C575.877216,112.960483 552.627632,99.9982143 457.329333,99.9982143 L242.670667,99.9982143 C147.372368,99.9982143 124.122784,112.960483 118.547883,118.535383 C112.972983,124.122784 99.9982143,147.372368 99.9982143,242.658167 L99.9982143,457.329333 C99.9982143,552.627632 112.972983,575.877216 118.547883,581.464617 C124.122784,587.027017 147.372368,600.001786 242.670667,600.001786 L457.329333,600.001786 C552.627632,600.001786 575.877216,587.027017 581.464617,581.464617 C587.039517,575.877216 600.001786,552.627632 600.001786,457.329333 Z M457.329333,0 C653.338333,0 700,46.6616668 700,242.658167 C700,438.667167 700,261.332833 700,457.329333 C700,653.338333 653.338333,700 457.329333,700 C261.332833,700 438.667167,700 242.670667,700 C46.6616668,700 0,653.338333 0,457.329333 C0,261.332833 0,352.118712 0,242.658167 C0,46.6616668 46.6616668,0 242.670667,0 C438.667167,0 261.332833,0 457.329333,0 Z M395.996667,200 C480.004166,200 500,220.008332 500,303.990835 C500,387.998334 500,312.001666 500,395.996667 C500,479.991668 480.004166,500 395.996667,500 C312.001666,500 387.998334,500 304.003333,500 C220.008332,500 200,479.991668 200,395.996667 C200,312.001666 200,350.906061 200,303.990835 C200,220.008332 220.008332,200 304.003333,200 C387.998334,200 312.001666,200 395.996667,200 Z" fill="${color}"/></defs>${svg}<use fill-rule="evenodd" transform="translate(0,0)" xlink:href="#${
        DefValues.point
    }"/><use fill-rule="evenodd" transform="translate(${
        size * moduleSize - 700
    },0)" xlink:href="#${
        DefValues.point
    }"/><use fill-rule="evenodd" transform="translate(0,${
        size * moduleSize - 700
    })" xlink:href="#${DefValues.point}"/></svg>`;
};

export default (data: string) => render(qrcode.create(data));
