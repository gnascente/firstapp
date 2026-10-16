const regexTest = function() {
    // Let's test with the actual string format from the codebase and fallback regex
    let text = "Test with @[sistema offloading](123) and @[entity name](456)";

    // The fallback general replacement
    let displayedText = text.replace(/@\[(.*?)\]\((.*?)\)/g, (match, name, id) => {
        let safeName = name;
        safeName = safeName.charAt(0).toUpperCase() + safeName.slice(1);
        const safeId = id;
        return `<span class="mention-link" onclick="App.focusEntity('${safeId}', '', 'log123')">@${safeName}</span>`;
    });

    console.log("After fallback regex:", displayedText);
}
regexTest();
