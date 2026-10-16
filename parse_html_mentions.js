const regexTest = function() {
    let displayedText = "This is a test with @Sistema Offloading and another @Entity Name and then some other text.";
    let safeEName1 = "Sistema Offloading";
    let safeEName2 = "Entity Name";

    const escapeRegex = function(string) { return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); };

    let escapedName1 = escapeRegex(safeEName1);
    let escapedName2 = escapeRegex(safeEName2);

    // Original regex: new RegExp(`(^|[^\\w>])@${escapedName}(?=[\\s\\.,;:]|$)`, 'g')
    let mentionRegexNew1 = new RegExp(`(^|[^\\w>])@${escapedName1}(?=[\\s\\.,;:]|$)`, 'g');
    let mentionRegexNew2 = new RegExp(`(^|[^\\w>])@${escapedName2}(?=[\\s\\.,;:]|$)`, 'g');

    console.log("Original text:", displayedText);

    let result1 = displayedText.replace(mentionRegexNew1, `$1<span class="mention-link">@Sistema Offloading</span>`);
    console.log("After match 1:", result1);

    let result2 = result1.replace(mentionRegexNew2, `$1<span class="mention-link">@Entity Name</span>`);
    console.log("After match 2:", result2);
}
regexTest();
