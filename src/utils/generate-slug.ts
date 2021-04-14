let keys = 'abcdefghijklmnopqrstuvwxyz';
keys += keys.toUpperCase();

const generateSlug = (length: number) => {
    let slug = '';

    for (let i = 0; i < length; i++) {
        slug += keys[Math.floor(Math.random() * keys.length)];
    }

    return slug;
};

export default generateSlug;
