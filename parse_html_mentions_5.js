const regexTest = function() {
    let plainText = "Here is a text with @sistema offloading and some more text.";
    let safeEName = "Sistema Offloading"; // The entity name might be capitalized in DB

    const escapeRegex = function(string) { return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); };
    let escapedName = escapeRegex(safeEName);

    // original 'g' regex
    let mentionRegexNew1 = new RegExp(`(^|[^\\w>])@${escapedName}(?=[\\s\\.,;:]|$)`, 'g');
    let result1 = plainText.replace(mentionRegexNew1, `$1<span class="mention-link">@Sistema offloading</span>`);
    console.log("After match 'g':", result1); // Doesn't match because plainText is lowercase, escapedName is capitalized

    // 'gi' regex
    let mentionRegexNew2 = new RegExp(`(^|[^\\w>])@${escapedName}(?=[\\s\\.,;:]|$)`, 'gi');
    let result2 = plainText.replace(mentionRegexNew2, `$1<span class="mention-link">@Sistema offloading</span>`);
    console.log("After match 'gi':", result2); // Matches
}
regexTest();
