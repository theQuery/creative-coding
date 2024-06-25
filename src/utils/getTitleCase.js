function getTitleCase(text) {
    return text.toLowerCase().split(/[\s-]/).map(word => {
        return word.replace(word[0], word[0].toUpperCase());
    }).join(' ');
}

export default getTitleCase;