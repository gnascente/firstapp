const regexTest = function() {
    let plainText = "Here is a text with @sistema offloading and some more text.";
    let safeEName1 = "Sistema offloading";

    const escapeRegex = function(string) { return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); };
    let escapedName1 = escapeRegex(safeEName1);

    let mentionRegexNew1 = new RegExp(`(^|[^\\w>])@${escapedName1}(?=[\\s\\.,;:]|$)`, 'gi');
    let result1 = plainText.replace(mentionRegexNew1, `$1<span class="mention-link">@Sistema offloading</span>`);
    console.log("After match 1 case insensitive (gi):", result1);
}
regexTest();
