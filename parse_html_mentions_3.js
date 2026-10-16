const regexTest = function() {
    let text = "Test with @[sistema offloading](123) and @[entity name](456)";

    // Simulating memory instruction: "Globally across the application, the first letter immediately following the '@' symbol in entity mentions must always be capitalized programmatically during text parsing and rendering."
    // Also, equipment names must be displayed with first letter capitalized, and the user mentioned something about spaces.

    // Let's modify the capitalize logic to capitalize all words if needed? Wait, the memory says "the first letter immediately following the '@' symbol".

    // Oh, the bug report says: "mentions with multiple words (e.g., @sistema offloading) fail to format as links, and an 'Edit' button is visually stretching too wide."

    let plainText = "Here is a text with @sistema offloading and some more text.";
    let safeEName1 = "sistema offloading";

    const escapeRegex = function(string) { return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); };
    let escapedName1 = escapeRegex(safeEName1);

    let mentionRegexNew1 = new RegExp(`(^|[^\\w>])@${escapedName1}(?=[\\s\\.,;:]|$)`, 'g');

    console.log("Original plain text:", plainText);
    let result1 = plainText.replace(mentionRegexNew1, `$1<span class="mention-link">@Sistema offloading</span>`);
    console.log("After match 1 case sensitive:", result1);

    // Case insensitive regex
    let mentionRegexNew2 = new RegExp(`(^|[^\\w>])@${escapedName1}(?=[\\s\\.,;:]|$)`, 'gi');
    let result2 = plainText.replace(mentionRegexNew2, `$1<span class="mention-link">@Sistema offloading</span>`);
    console.log("After match 1 case insensitive:", result2);
}
regexTest();
