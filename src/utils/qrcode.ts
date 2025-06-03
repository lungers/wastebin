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

    const color = '#d0d7e2';
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
            ? `<rect id=${DefValues.empty} width="100" height="100" rx="50" fill="${color}"/>`
            : ''
    }${
        usedDefs.has(DefValues.b)
            ? `<path id=${DefValues.b} d="M0 50C0 22.3858 22.3858 0 50 0V0C77.6142 0 100 22.3858 100 50V100H0V50Z" fill="${color}"/>`
            : ''
    }${
        usedDefs.has(DefValues.r)
            ? `<path id=${DefValues.r} d="M0 50C0 22.3858 22.3858 0 50 0H100V100H50C22.3858 100 0 77.6142 0 50V50Z" fill="${color}"/>`
            : ''
    }${
        usedDefs.has(DefValues.l)
            ? `<path id=${DefValues.l} d="M0 0H50C77.6142 0 100 22.3858 100 50V50C100 77.6142 77.6142 100 50 100H0V0Z" fill="${color}"/>`
            : ''
    }${
        usedDefs.has(DefValues.t)
            ? `<path id=${DefValues.t} d="M0 0H100V50C100 77.6142 77.6142 100 50 100V100C22.3858 100 0 77.6142 0 50V0Z" fill="${color}"/>`
            : ''
    }${
        usedDefs.has(DefValues.lt)
            ? `<path id=${DefValues.lt} d="M0 0H100V50C100 77.6142 77.6142 100 50 100H0V0Z" fill="${color}"/>`
            : ''
    }${
        usedDefs.has(DefValues.lb)
            ? `<path id=${DefValues.lb} d="M0 0H50C77.6142 0 100 22.3858 100 50V100H0V0Z" fill="${color}"/>`
            : ''
    }${
        usedDefs.has(DefValues.rb)
            ? `<path id=${DefValues.rb} d="M0 50C0 22.3858 22.3858 0 50 0H100V100H0V50Z" fill="${color}"/>`
            : ''
    }${
        usedDefs.has(DefValues.rt)
            ? `<path id=${DefValues.rt} d="M0 0H100V100H50C22.3858 100 0 77.6142 0 50V0Z" fill="${color}"/>`
            : ''
    }${
        usedDefs.has(DefValues.n_lt)
            ? `<path id=${DefValues.n_lt} d="M52 2V0L0 0L2.41399e-06 52H2C2 24.3867 24.3857 2 52 2Z" fill="${color}"/>`
            : ''
    }${
        usedDefs.has(DefValues.n_lb)
            ? `<path id=${DefValues.n_lb} d="M2 52L0 52L2.27299e-06 104L52 104V102C24.3867 102 2 79.6143 2 52Z" fill="${color}"/>`
            : ''
    }${
        usedDefs.has(DefValues.n_rt)
            ? `<path id=${DefValues.n_rt} d="M102 52H104L104 0L52 1.40997e-07L52 2C79.6133 2 102 24.3857 102 52Z" fill="${color}"/>`
            : ''
    }${
        usedDefs.has(DefValues.n_rb)
            ? `<path id=${DefValues.n_rb} d="M52 102L52 104L104 104L104 52L102 52C102 79.6133 79.6143 102 52 102Z" fill="${color}"/>`
            : ''
    }<g id=${
        DefValues.point
    }><path d="M102.012 193.243C93.8683 229.888 90 279.998 90 350C90 420.002 93.8683 470.112 102.012 506.757C109.929 542.38 120.641 559.531 130.555 569.445C140.469 579.359 157.62 590.071 193.243 597.988C229.888 606.132 279.998 610 350 610C420.002 610 470.112 606.132 506.757 597.988C542.38 590.071 559.531 579.359 569.445 569.445C579.359 559.531 590.071 542.38 597.988 506.757C606.132 470.112 610 420.002 610 350C610 279.998 606.132 229.888 597.988 193.243C590.071 157.62 579.359 140.469 569.445 130.555C559.531 120.641 542.38 109.929 506.757 102.012C470.112 93.8683 420.002 90 350 90C279.998 90 229.888 93.8683 193.243 102.012C157.62 109.929 140.469 120.641 130.555 130.555C120.641 140.469 109.929 157.62 102.012 193.243ZM350 0C61.775 0 0 61.775 0 350C0 638.225 61.775 700 350 700C638.225 700 700 638.225 700 350C700 61.775 638.225 0 350 0Z" fill="${color}"/><path d="M200 350C200 226.475 226.475 200 350 200C473.525 200 500 226.475 500 350C500 473.525 473.525 500 350 500C226.475 500 200 473.525 200 350Z" fill="${color}"/></g></defs>${svg}<use fill-rule="evenodd" transform="translate(0,0)" xlink:href="#${
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
